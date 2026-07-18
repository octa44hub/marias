import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const sale = await prisma.sale.findUnique({
      where: { id: params.id },
      include: { items: { orderBy: { productName: "asc" } } },
    });
    if (!sale) return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 });
    return NextResponse.json(sale);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar venda" }, { status: 500 });
  }
}
