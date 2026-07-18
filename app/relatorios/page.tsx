"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { SaleStatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { Sale, ReportSummary, PAYMENT_METHOD_LABELS, PaymentMethod } from "@/types";
import { formatCurrency, formatDate, formatTime, getTodayISO, getCurrentMonthRange } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type Period = "today" | "week" | "month" | "custom";

function getPeriodDates(period: Period): { start: string; end: string } {
  const today = getTodayISO();
  if (period === "today") return { start: today, end: today };
  if (period === "month") return getCurrentMonthRange();
  if (period === "week") {
    const d = new Date();
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    return {
      start: monday.toISOString().split("T")[0],
      end: today,
    };
  }
  return { start: today, end: today };
}

export default function RelatoriosPage() {
  const { error: showError } = useToast();
  const [period, setPeriod] = useState<Period>("today");
  const [startDate, setStartDate] = useState(getTodayISO());
  const [endDate, setEndDate] = useState(getTodayISO());
  const [paymentFilter, setPaymentFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        ...(paymentFilter ? { paymentMethod: paymentFilter } : {}),
        ...(customerFilter ? { customerName: customerFilter } : {}),
        ...(productFilter ? { productSearch: productFilter } : {}),
      });
      const res = await fetch(`/api/sales?${params}`);
      if (!res.ok) throw new Error();
      setSales(await res.json());
    } catch {
      showError("Erro ao carregar relatório");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, paymentFilter, customerFilter, productFilter, showError]);

  useEffect(() => {
    const dates = getPeriodDates(period);
    if (period !== "custom") {
      setStartDate(dates.start);
      setEndDate(dates.end);
    }
  }, [period]);

  useEffect(() => {
    const t = setTimeout(fetchSales, 300);
    return () => clearTimeout(t);
  }, [fetchSales]);

  // Cálculo do resumo (apenas vendas COMPLETED)
  const completed = sales.filter((s) => s.status === "COMPLETED");
  const summary: ReportSummary = {
    totalRevenue: completed.reduce((s, v) => s + v.total, 0),
    totalSales: completed.length,
    totalUnits: completed.reduce((s, v) => s + v.items.reduce((a, i) => a + i.quantity, 0), 0),
    totalDiscounts: completed.reduce((s, v) => s + v.discount, 0),
    averageTicket: completed.length > 0
      ? Math.round(completed.reduce((s, v) => s + v.total, 0) / completed.length)
      : 0,
  };

  const PERIODS: { key: Period; label: string }[] = [
    { key: "today", label: "Hoje" },
    { key: "week", label: "Esta semana" },
    { key: "month", label: "Este mês" },
    { key: "custom", label: "Personalizado" },
  ];

  function handlePrint() {
    window.print();
  }

  return (
    <AppLayout>
      {/* Filtros de período */}
      <Card padding="md" className="mb-4 no-print">
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  period === p.key
                    ? "bg-primary-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {period === "custom" && (
            <div className="flex gap-3">
              <Input
                label="De"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="Até"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              placeholder="Todas as formas"
            >
              {Object.entries(PAYMENT_METHOD_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
            <Input
              placeholder="Filtrar por cliente"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
            />
            <Input
              placeholder="Filtrar por produto"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Resumo — versão impressão mostra período */}
      <div className="print-only mb-6">
        <h1 className="text-2xl font-bold">Bazar PDV — Relatório de Vendas</h1>
        <p className="text-gray-600">
          Período: {formatDate(startDate + "T12:00:00")} a {formatDate(endDate + "T12:00:00")}
          {" · "}Emitido em: {formatDate(new Date())}
        </p>
      </div>

      {/* Cards de resumo */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          <StatCard label="Faturamento" value={formatCurrency(summary.totalRevenue)} highlight />
          <StatCard label="Vendas" value={String(summary.totalSales)} />
          <StatCard label="Unidades" value={String(summary.totalUnits)} />
          <StatCard label="Descontos" value={formatCurrency(summary.totalDiscounts)} />
          <StatCard label="Ticket médio" value={formatCurrency(summary.averageTicket)} />
        </div>
      )}

      {/* Botão imprimir */}
      {!loading && sales.length > 0 && (
        <div className="flex justify-end mb-3 no-print">
          <Button variant="secondary" size="sm" onClick={handlePrint}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir / Salvar PDF
          </Button>
        </div>
      )}

      {/* Lista de vendas */}
      {loading && <PageLoader />}

      {!loading && sales.length === 0 && (
        <EmptyState
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title="Nenhuma venda encontrada neste período"
        />
      )}

      {!loading && sales.length > 0 && (
        <>
          {/* Tabela desktop */}
          <div className="hidden md:block bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Data</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Hora</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Itens</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Total</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Pagamento</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Cliente</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className={cn(
                      "hover:bg-gray-50 transition-colors cursor-pointer",
                      sale.status === "CANCELLED" && "opacity-60"
                    )}
                  >
                    <td className="px-4 py-3">
                      <Link href={`/vendas/${sale.id}`} className="font-mono text-primary-600 hover:underline">
                        #{sale.saleNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{formatDate(sale.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatTime(sale.createdAt)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {sale.items.reduce((s, i) => s + i.quantity, 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {PAYMENT_METHOD_LABELS[sale.paymentMethod]}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{sale.customerName || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <SaleStatusBadge status={sale.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="md:hidden space-y-3">
            {sales.map((sale) => (
              <Link key={sale.id} href={`/vendas/${sale.id}`}>
                <div className={cn(
                  "bg-white rounded-2xl shadow-card border border-gray-100 p-4",
                  sale.status === "CANCELLED" && "opacity-60"
                )}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-mono text-sm font-semibold text-primary-600">#{sale.saleNumber}</span>
                      <p className="text-xs text-gray-500">{formatDate(sale.createdAt)} · {formatTime(sale.createdAt)}</p>
                    </div>
                    <SaleStatusBadge status={sale.status} />
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-sm text-gray-600">
                      <span>{PAYMENT_METHOD_LABELS[sale.paymentMethod]}</span>
                      {sale.customerName && <span className="ml-2">· {sale.customerName}</span>}
                    </div>
                    <span className="font-bold text-lg text-gray-900">{formatCurrency(sale.total)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </AppLayout>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn(
      "rounded-2xl p-4 border",
      highlight
        ? "bg-primary-600 border-primary-700 text-white"
        : "bg-white border-gray-100 shadow-card"
    )}>
      <p className={cn("text-xs font-medium mb-1", highlight ? "text-primary-200" : "text-gray-500")}>
        {label}
      </p>
      <p className={cn("text-lg font-bold leading-tight", highlight ? "text-white" : "text-gray-900")}>
        {value}
      </p>
    </div>
  );
}
