import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const sale = await prisma.sale.findUnique({
      where: { id: params.id },
      include: { items: true },
    });
    if (!sale) return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 });
    if (sale.status === "CANCELLED")
      return NextResponse.json({ error: "Esta venda já foi cancelada" }, { status: 400 });

    const cancelled = await prisma.$transaction(async (tx) => {
      // Devolve estoque
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity } },
        });
      }
      // Cancela a venda
      return tx.sale.update({
        where: { id: params.id },
        data: { status: "CANCELLED", cancelledAt: new Date() },
        include: { items: true },
      });
    });

    return NextResponse.json(cancelled);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao cancelar venda" }, { status: 500 });
  }
}
