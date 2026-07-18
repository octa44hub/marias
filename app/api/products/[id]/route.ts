import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function checkAuth() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await checkAuth()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await checkAuth()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const body = await req.json();
    const { code, name, quantity, price } = body;
    if (!code?.trim()) return NextResponse.json({ error: "Código é obrigatório" }, { status: 400 });
    if (!name?.trim()) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    if (typeof quantity !== "number" || quantity < 0 || !Number.isInteger(quantity))
      return NextResponse.json({ error: "Quantidade inválida" }, { status: 400 });
    if (typeof price !== "number" || price <= 0)
      return NextResponse.json({ error: "Valor deve ser maior que zero" }, { status: 400 });
    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    const conflict = await prisma.product.findFirst({
      where: { code: code.trim().toUpperCase(), NOT: { id: params.id } },
    });
    if (conflict) return NextResponse.json({ error: "Código já utilizado por outro produto" }, { status: 409 });
    const product = await prisma.product.update({
      where: { id: params.id },
      data: { code: code.trim().toUpperCase(), name: name.trim(), quantity, price },
    });
    return NextResponse.json(product);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao editar produto" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await checkAuth()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const body = await req.json();
    const { action } = body;
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { _count: { select: { saleItems: true } } },
    });
    if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    if (action === "delete") {
      if (product._count.saleItems > 0)
        return NextResponse.json({ error: "Produto já utilizado em vendas. Use inativar." }, { status: 400 });
      await prisma.product.delete({ where: { id: params.id } });
      return NextResponse.json({ success: true });
    }
    if (action === "activate" || action === "deactivate") {
      const updated = await prisma.product.update({
        where: { id: params.id },
        data: { status: action === "activate" ? "ACTIVE" : "INACTIVE" },
      });
      return NextResponse.json(updated);
    }
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}
