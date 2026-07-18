"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SaleStatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { Sale, PAYMENT_METHOD_LABELS } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

export default function VendaDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { success, error: showError } = useToast();

  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/sales/${id}`);
        if (!res.ok) throw new Error();
        setSale(await res.json());
      } catch {
        showError("Erro ao carregar venda");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, showError]);

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch(`/api/sales/${id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { showError(data.error || "Erro ao cancelar venda"); return; }
      success("Venda cancelada. Estoque devolvido.");
      setSale(data);
      setCancelModal(false);
    } catch {
      showError("Erro de conexão");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <AppLayout><PageLoader /></AppLayout>;
  if (!sale) return <AppLayout><p className="text-center text-gray-500 mt-8">Venda não encontrada.</p></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto space-y-4">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Venda #{sale.saleNumber}</h1>
            <p className="text-sm text-gray-500">{formatDateTime(sale.createdAt)}</p>
          </div>
          <SaleStatusBadge status={sale.status} />
        </div>

        {/* Produtos */}
        <Card padding="md">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Produtos</h2>
          <div className="space-y-2">
            {sale.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0 pr-3">
                  <span className="font-mono text-xs text-gray-400">{item.productCode} </span>
                  <span className="text-gray-900">{item.productName}</span>
                  <p className="text-xs text-gray-500">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                </div>
                <span className="font-semibold text-gray-900 flex-shrink-0">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span><span>{formatCurrency(sale.subtotal)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-sm text-green-700">
                <span>Desconto</span><span>- {formatCurrency(sale.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 text-lg pt-1">
              <span>Total</span>
              <span className="text-primary-600">{formatCurrency(sale.total)}</span>
            </div>
          </div>
        </Card>

        {/* Pagamento */}
        <Card padding="md">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Pagamento</h2>
          <div className="space-y-2 text-sm">
            <Row label="Forma" value={PAYMENT_METHOD_LABELS[sale.paymentMethod]} />
            {sale.installments && sale.installments > 1 && (
              <Row label="Parcelas" value={`${sale.installments}×`} />
            )}
            {sale.customerName && (
              <Row label="Cliente" value={sale.customerName} />
            )}
          </div>
        </Card>

        {/* Cancelamento */}
        {sale.cancelledAt && (
          <Card padding="md">
            <p className="text-sm text-red-700">
              <strong>Cancelada em:</strong> {formatDateTime(sale.cancelledAt)}
            </p>
          </Card>
        )}

        {/* Ações */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => router.back()} fullWidth>
            Voltar
          </Button>
          {sale.status === "COMPLETED" && (
            <Button variant="danger" onClick={() => setCancelModal(true)} fullWidth>
              Cancelar venda
            </Button>
          )}
        </div>
      </div>

      {/* Modal de cancelamento */}
      <Modal open={cancelModal} onClose={() => setCancelModal(false)} title="Cancelar venda" size="sm">
        <div className="px-5 pb-5">
          <p className="text-gray-700 text-sm mb-5">
            Deseja realmente cancelar esta venda? Os produtos retornarão ao estoque.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setCancelModal(false)} disabled={cancelling}>
              Não
            </Button>
            <Button variant="danger" fullWidth loading={cancelling} onClick={handleCancel}>
              Sim, cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
