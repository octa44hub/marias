"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatters";
import { PAYMENT_METHOD_LABELS, PaymentMethod } from "@/types";
import { CartItem } from "@/types";

interface SaleConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod | null;
  installments: number;
  customerName: string;
}

export function SaleConfirmModal({
  open,
  onClose,
  onConfirm,
  loading,
  items,
  subtotal,
  discount,
  total,
  paymentMethod,
  installments,
  customerName,
}: SaleConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Confirmar venda" size="md">
      <div className="px-5 pb-5 space-y-4">
        {/* Itens */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {items.length} produto{items.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-gray-700 flex-1 truncate pr-2">
                  {item.quantity}× {item.productName}
                </span>
                <span className="font-medium text-gray-900 flex-shrink-0">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-700">
              <span>Desconto</span>
              <span>- {formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg text-gray-900 pt-1">
            <span>Total</span>
            <span className="text-primary-600">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Pagamento */}
        <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Pagamento</span>
            <span className="font-medium text-gray-900">
              {paymentMethod ? PAYMENT_METHOD_LABELS[paymentMethod] : "—"}
            </span>
          </div>
          {paymentMethod === "CREDIT_CARD" && installments > 1 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Parcelas</span>
              <span className="font-medium text-gray-900">{installments}×</span>
            </div>
          )}
          {customerName && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Cliente</span>
              <span className="font-medium text-gray-900">{customerName}</span>
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-1">
          <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>
            Voltar
          </Button>
          <Button fullWidth onClick={onConfirm} loading={loading} disabled={loading}>
            Confirmar venda
          </Button>
        </div>
      </div>
    </Modal>
  );
}
