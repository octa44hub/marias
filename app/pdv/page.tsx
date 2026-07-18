"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductSearch } from "@/components/pdv/ProductSearch";
import { CartItemRow } from "@/components/pdv/CartItem";
import { SaleConfirmModal } from "@/components/pdv/SaleConfirmModal";
import { Button } from "@/components/ui/Button";
import { MoneyInput, Input, Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { usePDVStore } from "@/store/pdvStore";
import { Product, PAYMENT_METHOD_LABELS, getStockStatus } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { Modal } from "@/components/ui/Modal";

export default function PDVPage() {
  const router = useRouter();
  const { success, error: showError, warning } = useToast();
  const store = usePDVStore();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal de aviso ao adicionar produto com problema
  const [warningModal, setWarningModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    product: Product | null;
  }>({ open: false, title: "", message: "", product: null });

  const subtotal = store.subtotal();
  const total = store.total();

  function handleSelectProduct(product: Product) {
    const status = getStockStatus(product);

    if (product.status === "INACTIVE") {
      setWarningModal({
        open: true,
        title: "Produto inativo",
        message: `"${product.name}" está inativo. Deseja adicionar mesmo assim?`,
        product,
      });
      return;
    }

    if (status === "out_of_stock") {
      setWarningModal({
        open: true,
        title: "Produto esgotado",
        message: `"${product.name}" está com estoque zerado. Deseja adicionar mesmo assim?`,
        product,
      });
      return;
    }

    addToCart(product);
  }

  function addToCart(product: Product) {
    store.addItem({
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      unitPrice: product.price,
      stockQuantity: product.quantity,
      quantity: 1,
    });
  }

  function validate(): string | null {
    if (store.items.length === 0) return "Adicione pelo menos um produto";
    if (!store.paymentMethod) return "Selecione a forma de pagamento";
    if (store.paymentMethod === "CREDIT_ACCOUNT" && !store.customerName.trim())
      return "Informe o nome do cliente para venda fiado";
    if (store.discount > subtotal) return "O desconto não pode ser maior que o subtotal";
    return null;
  }

  function handleFinalize() {
    const err = validate();
    if (err) { showError(err); return; }
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    if (saving) return;
    setSaving(true);

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: store.items.map((i) => ({
            productId: i.productId,
            productCode: i.productCode,
            productName: i.productName,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          discount: store.discount,
          paymentMethod: store.paymentMethod,
          installments: store.installments,
          customerName: store.customerName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || "Erro ao finalizar venda");
        return;
      }

      success(`Venda #${data.saleNumber} finalizada com sucesso!`);
      store.clearCart();
      setConfirmOpen(false);
      router.refresh();
    } catch {
      showError("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const PAYMENT_OPTIONS = Object.entries(PAYMENT_METHOD_LABELS);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Busca de produtos */}
        <Card padding="sm">
          <div className="p-1">
            <ProductSearch onSelect={handleSelectProduct} />
          </div>
        </Card>

        {/* Carrinho vazio */}
        {store.items.length === 0 && (
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            title="Carrinho vazio"
            description="Adicione produtos para iniciar uma venda."
          />
        )}

        {/* Itens do carrinho */}
        {store.items.length > 0 && (
          <div className="space-y-2">
            {store.items.map((item) => (
              <CartItemRow key={item.productId} item={item} />
            ))}
          </div>
        )}

        {/* Resumo, pagamento e finalização */}
        {store.items.length > 0 && (
          <Card padding="md">
            <div className="space-y-4">

              {/* Resumo financeiro */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({store.items.length} {store.items.length === 1 ? "item" : "itens"})</span>
                  <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                </div>

                {store.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Desconto</span>
                    <span>- {formatCurrency(store.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Desconto */}
              <MoneyInput
                label="Desconto (R$)"
                value={store.discount}
                onChange={(v) => store.setDiscount(v)}
                hint={`Máximo: ${formatCurrency(subtotal)}`}
              />

              {/* Forma de pagamento */}
              <Select
                label="Forma de pagamento *"
                value={store.paymentMethod || ""}
                onChange={(e) => store.setPaymentMethod(e.target.value as never || null)}
                placeholder="Selecione..."
              >
                {PAYMENT_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>

              {/* Parcelas (cartão de crédito) */}
              {store.paymentMethod === "CREDIT_CARD" && (
                <Select
                  label="Número de parcelas"
                  value={store.installments}
                  onChange={(e) => store.setInstallments(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}×</option>
                  ))}
                </Select>
              )}

              {/* Nome do cliente */}
              <Input
                label={`Nome do cliente${store.paymentMethod === "CREDIT_ACCOUNT" ? " *" : ""}`}
                value={store.customerName}
                onChange={(e) => store.setCustomerName(e.target.value)}
                placeholder="Nome do cliente (opcional)"
                hint={store.paymentMethod === "CREDIT_ACCOUNT" ? "Obrigatório para vendas fiado" : undefined}
              />

              {/* Botões de ação */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (confirm("Deseja limpar o carrinho?")) store.clearCart();
                  }}
                >
                  Limpar
                </Button>
                <Button fullWidth size="lg" onClick={handleFinalize}>
                  Finalizar venda
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Modal de confirmação */}
      <SaleConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        loading={saving}
        items={store.items}
        subtotal={subtotal}
        discount={store.discount}
        total={total}
        paymentMethod={store.paymentMethod}
        installments={store.installments}
        customerName={store.customerName}
      />

      {/* Modal de aviso (produto inativo/esgotado) */}
      <Modal
        open={warningModal.open}
        onClose={() => setWarningModal((s) => ({ ...s, open: false, product: null }))}
        title={warningModal.title}
        size="sm"
      >
        <div className="px-5 pb-5">
          <p className="text-gray-700 text-sm mb-5">{warningModal.message}</p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setWarningModal((s) => ({ ...s, open: false, product: null }))}
            >
              Cancelar
            </Button>
            <Button
              fullWidth
              onClick={() => {
                if (warningModal.product) addToCart(warningModal.product);
                setWarningModal((s) => ({ ...s, open: false, product: null }));
              }}
            >
              Adicionar mesmo assim
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
