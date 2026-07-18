import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

  try {
    const now = new Date();
    const tzOffset = -3 * 60; // UTC-3 (Brasília)
    const localNow = new Date(now.getTime() + tzOffset * 60 * 1000);

    const todayStart = new Date(`${localNow.toISOString().split("T")[0]}T03:00:00.000Z`); // meia-noite BRT = 03:00 UTC
    const monthStart = new Date(
      Date.UTC(localNow.getFullYear(), localNow.getMonth(), 1) + tzOffset * 60 * 1000
    );

    const [todaySales, monthSales, productStats] = await Promise.all([
      // Vendas de hoje
      prisma.sale.findMany({
        where: {
          status: "COMPLETED",
          createdAt: { gte: todayStart },
        },
        select: { total: true },
      }),

      // Vendas do mês
      prisma.sale.findMany({
        where: {
          status: "COMPLETED",
          createdAt: { gte: monthStart },
        },
        select: { total: true },
      }),

      // Estatísticas de produtos
      prisma.product.aggregate({
        where: { status: "ACTIVE", quantity: { gt: 0 } },
        _count: { id: true },
        _sum: { quantity: true },
      }),
    ]);

    return NextResponse.json({
      revenueToday: todaySales.reduce((s, v) => s + v.total, 0),
      revenueMonth: monthSales.reduce((s, v) => s + v.total, 0),
      salesToday: todaySales.length,
      salesMonth: monthSales.length,
      totalProducts: productStats._count.id,
      totalUnits: productStats._sum.quantity || 0,
    });
  } catch (err) {
    console.error("GET /api/dashboard:", err);
    return NextResponse.json({ error: "Erro ao carregar dashboard" }, { status: 500 });
  }
}
