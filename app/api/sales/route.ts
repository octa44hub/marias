import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentMethod } from "@prisma/client";

// GET /api/sales — lista vendas com filtros
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const paymentMethod = searchParams.get("paymentMethod");
    const customerName = searchParams.get("customerName");
    const productSearch = searchParams.get("productSearch");

    const sales = await prisma.sale.findMany({
      where: {
        ...(startDate && endDate
          ? {
              createdAt: {
                gte: new Date(`${startDate}T00:00:00-03:00`),
                lte: new Date(`${endDate}T23:59:59-03:00`),
              },
            }
          : {}),
        ...(paymentMethod ? { paymentMethod: paymentMethod as PaymentMethod } : {}),
        ...(customerName
          ? { customerName: { contains: customerName, mode: "insensitive" } }
          : {}),
        ...(productSearch
          ? {
              items: {
                some: {
                  OR: [
                    { productCode: { contains: productSearch, mode: "insensitive" } },
                    { productName: { contains: productSearch, mode: "insensitive" } },
                  ],
                },
              },
            }
          : {}),
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sales);
  } catch (err) {
    console.error("GET /api/sales:", err);
    return NextResponse.json({ error: "Erro ao buscar vendas" }, { status: 500 });
  }
}

// POST /api/sales — finaliza uma venda (transação atômica)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, discount, paymentMethod, installments, customerName } = body;

    if (!items || items.length === 0)
      return NextResponse.json({ error: "A venda deve ter pelo menos um produto" }, { status: 400 });
    if (!paymentMethod)
      return NextResponse.json({ error: "Selecione a forma de pagamento" }, { status: 400 });
    if (paymentMethod === "CREDIT_ACCOUNT" && !customerName?.trim())
      return NextResponse.json({ error: "Nome do cliente é obrigatório para vendas fiado" }, { status: 400 });

    const subtotal = items.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) => sum + item.quantity * item.unitPrice,
      0
    );
    const validDiscount = Math.min(Math.max(0, discount || 0), subtotal);
    const total = subtotal - validDiscount;

    const sale = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Produto ${item.productId} não encontrado`);
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      const seq = await tx.saleSequence.update({
        where: { id: 1 },
        data: { lastNum: { increment: 1 } },
      });

      const saleNumber = String(seq.lastNum).padStart(6, "0");

      return tx.sale.create({
        data: {
          saleNumber,
          subtotal,
          discount: validDiscount,
          total,
          paymentMethod: paymentMethod as PaymentMethod,
          installments: paymentMethod === "CREDIT_CARD" ? (installments || 1) : null,
          customerName: customerName?.trim() || null,
          status: "COMPLETED",
          items: {
            create: items.map((item: {
              productId: string;
              productCode: string;
              productName: string;
              quantity: number;
              unitPrice: number;
            }) => ({
              productId: item.productId,
              productCode: item.productCode,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.quantity * item.unitPrice,
            })),
          },
        },
        include: { items: true },
      });
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/sales:", err);
    const message = err instanceof Error ? err.message : "Erro ao finalizar venda";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
