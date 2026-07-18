import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products — lista todos os produtos
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q") || "";
    const status = searchParams.get("status") || "all";

    const products = await prisma.product.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { code: { contains: search, mode: "insensitive" } },
                { name: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(status !== "all"
          ? { status: status === "active" ? "ACTIVE" : "INACTIVE" }
          : {}),
      },
      orderBy: [{ status: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error("GET /api/products:", err);
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}

// POST /api/products — cria um novo produto
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, name, quantity, price } = body;

    if (!code?.trim()) return NextResponse.json({ error: "Código é obrigatório" }, { status: 400 });
    if (!name?.trim()) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    if (typeof quantity !== "number" || quantity < 0 || !Number.isInteger(quantity))
      return NextResponse.json({ error: "Quantidade deve ser um inteiro maior ou igual a zero" }, { status: 400 });
    if (typeof price !== "number" || price <= 0)
      return NextResponse.json({ error: "Valor deve ser maior que zero" }, { status: 400 });

    const existing = await prisma.product.findUnique({ where: { code: code.trim() } });
    if (existing)
      return NextResponse.json({ error: "Já existe um produto com este código" }, { status: 409 });

    const product = await prisma.product.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        quantity,
        price,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("POST /api/products:", err);
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}
