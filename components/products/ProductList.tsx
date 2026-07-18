"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Product, getStockStatus, PAYMENT_METHOD_LABELS } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { StockBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

type FilterStatus = "all" | "in_stock" | "low_stock" | "out_of_stock" | "inactive";

export function ProductList() {
  const { success, error: showError } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [actionProduct, setActionProduct] = useState<Product | null>(null);
  const [actionType, setActionType] = useState<"deactivate" | "activate" | "delete" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProducts(data);
    } catch {
      showError("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }, [search, showError]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  // Filtros por status visual
  const filtered = products.filter((p) => {
    const status = getStockStatus(p);
    if (filter === "all") return true;
    if (filter === "in_stock") return status === "in_stock";
    if (filter === "low_stock") return status === "low_stock";
    if (filter === "out_of_stock") return status === "out_of_stock";
    if (filter === "inactive") return status === "inactive";
    return true;
  });

  async function handleAction() {
    if (!actionProduct || !actionType) return;
    setActionLoading(true);
    try {
      const action =
        actionType === "activate"
          ? "activate"
          : actionType === "deactivate"
          ? "deactivate"
          : "delete";

      const res = await fetch(`/api/products/${actionProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) {
        showError(data.error || "Erro ao executar ação");
        return;
      }

      const messages: Record<string, string> = {
        activate: "Produto reativado!",
        deactivate: "Produto inativado.",
        delete: "Produto excluído.",
      };
      success(messages[action]);
      setActionProduct(null);
      setActionType(null);
      fetchProducts();
    } catch {
      showError("Erro de conexão");
    } finally {
      setActionLoading(false);
    }
  }

  const FILTERS: { key: FilterStatus; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "in_stock", label: "Em estoque" },
    { key: "low_stock", label: "Estoque baixo" },
    { key: "out_of_stock", label: "Esgotados" },
    { key: "inactive", label: "Inativos" },
  ];

  const actionMessages: Record<string, string> = {
    deactivate: "Deseja inativar este produto? Ele não ficará disponível no PDV.",
    activate: "Deseja reativar este produto?",
    delete: "Deseja excluir definitivamente este produto? Esta ação não pode ser desfeita.",
  };

  return (
    <div>
      {/* Busca e filtros */}
      <div className="mb-4 space-y-3">
        <Input
          placeholder="Buscar por código ou nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                filter === f.key
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Estado de carregamento */}
      {loading && <PageLoader />}

      {/* Lista vazia */}
      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          title={
            search
              ? "Nenhum produto encontrado para esta busca"
              : products.length === 0
              ? "Nenhum produto cadastrado"
              : "Nenhum produto neste filtro"
          }
          description={
            products.length === 0
              ? "Adicione o primeiro produto para começar."
              : undefined
          }
          action={
            products.length === 0 ? (
              <Link href="/produtos/novo">
                <Button size="sm">Adicionar produto</Button>
              </Link>
            ) : undefined
          }
        />
      )}

      {/* Tabela — desktop */}
      {!loading && filtered.length > 0 && (
        <>
          <div className="hidden md:block bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Código</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Nome</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Qtd.</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Valor</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => {
                  const status = getStockStatus(p);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-gray-700">{p.code}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{p.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-900 font-medium">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StockBadge status={status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link href={`/produtos/${p.id}/editar`}>
                            <Button size="sm" variant="ghost">Editar</Button>
                          </Link>
                          {p.status === "ACTIVE" ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setActionProduct(p); setActionType("deactivate"); }}
                            >
                              Inativar
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setActionProduct(p); setActionType("activate"); }}
                            >
                              Reativar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
              {filtered.length} produto{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Cards — mobile */}
          <div className="md:hidden space-y-3">
            {filtered.map((p) => {
              const status = getStockStatus(p);
              return (
                <div key={p.id} className="bg-white rounded-2xl shadow-card border border-gray-100 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-mono text-xs text-gray-500">{p.code}</span>
                      <h3 className="font-semibold text-gray-900">{p.name}</h3>
                    </div>
                    <StockBadge status={status} />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-500">Qtd: <strong className="text-gray-800">{p.quantity}</strong></span>
                      <span className="text-gray-500">Valor: <strong className="text-gray-800">{formatCurrency(p.price)}</strong></span>
                    </div>
                    <div className="flex gap-1">
                      <Link href={`/produtos/${p.id}/editar`}>
                        <Button size="sm" variant="secondary">Editar</Button>
                      </Link>
                      {p.status === "ACTIVE" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setActionProduct(p); setActionType("deactivate"); }}
                        >
                          Inativar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setActionProduct(p); setActionType("activate"); }}
                        >
                          Reativar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal de confirmação */}
      <Modal
        open={!!actionProduct && !!actionType}
        onClose={() => { setActionProduct(null); setActionType(null); }}
        title="Confirmar ação"
        size="sm"
      >
        <div className="px-5 pb-5">
          <p className="text-gray-700 text-sm mb-1">
            {actionProduct && <strong>{actionProduct.name}</strong>}
          </p>
          <p className="text-gray-600 text-sm mb-5">
            {actionType && actionMessages[actionType]}
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => { setActionProduct(null); setActionType(null); }}
              disabled={actionLoading}
            >
              Cancelar
            </Button>
            <Button
              variant={actionType === "delete" ? "danger" : "primary"}
              fullWidth
              loading={actionLoading}
              onClick={handleAction}
            >
              {actionType === "activate" ? "Reativar" : actionType === "delete" ? "Excluir" : "Inativar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
