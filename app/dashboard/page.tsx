"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { DashboardSummary } from "@/types";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { error: showError } = useToast();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [revPeriod, setRevPeriod] = useState<"today" | "month">("today");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error();
        setData(await res.json());
      } catch {
        showError("Erro ao carregar resumo");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showError]);

  if (loading) {
    return (
      <AppLayout>
        <PageLoader />
      </AppLayout>
    );
  }

  const revenue = revPeriod === "today" ? data?.revenueToday : data?.revenueMonth;
  const salesCount = revPeriod === "today" ? data?.salesToday : data?.salesMonth;

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Boas-vindas */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Olá!</h1>
            <p className="text-sm text-gray-500">{formatDate(new Date())}</p>
          </div>
        </div>

        {/* Card de faturamento */}
        <Card padding="lg" className="bg-gradient-to-br from-primary-600 to-indigo-700 border-0 text-white">
          <div className="flex items-center justify-between mb-3">
            <p className="text-primary-200 text-sm font-medium">Faturamento</p>
            {/* Toggle período */}
            <div className="flex gap-1 bg-white/10 rounded-full p-0.5">
              {(["today", "month"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setRevPeriod(p)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold transition-all",
                    revPeriod === p
                      ? "bg-white text-primary-700"
                      : "text-white/80 hover:text-white"
                  )}
                >
                  {p === "today" ? "Hoje" : "Mês"}
                </button>
              ))}
            </div>
          </div>
          <p className="text-4xl font-bold tracking-tight mb-1">
            {formatCurrency(revenue ?? 0)}
          </p>
          <p className="text-primary-200 text-sm">
            {salesCount} venda{salesCount !== 1 ? "s" : ""}{" "}
            {revPeriod === "today" ? "hoje" : "este mês"}
          </p>
        </Card>

        {/* Card de estoque */}
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Produtos em estoque</p>
              <p className="font-bold text-gray-900">
                {data?.totalProducts ?? 0} produto{data?.totalProducts !== 1 ? "s" : ""}{" "}
                disponíveis
              </p>
              <p className="text-xs text-gray-400">
                {data?.totalUnits ?? 0} unidades no total
              </p>
            </div>
          </div>
        </Card>

        {/* Botões de ação rápida */}
        <div className="grid grid-cols-1 gap-3">
          <Link href="/pdv">
            <button className="w-full flex items-center gap-4 bg-primary-600 hover:bg-primary-700
              text-white rounded-2xl p-5 transition-colors shadow-lg shadow-primary-200/40">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-bold text-lg leading-tight">Abrir PDV</p>
                <p className="text-primary-200 text-sm">Registrar uma nova venda</p>
              </div>
              <svg className="w-5 h-5 ml-auto opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/relatorios">
              <button className="w-full flex flex-col items-start gap-2 bg-white border border-gray-100
                shadow-card rounded-2xl p-4 hover:shadow-card-hover transition-shadow">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Ver relatório</p>
                  <p className="text-xs text-gray-400">Vendas e faturamento</p>
                </div>
              </button>
            </Link>

            <Link href="/produtos">
              <button className="w-full flex flex-col items-start gap-2 bg-white border border-gray-100
                shadow-card rounded-2xl p-4 hover:shadow-card-hover transition-shadow">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Produtos</p>
                  <p className="text-xs text-gray-400">Gerenciar estoque</p>
                </div>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
