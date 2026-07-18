"use client";

import { CartItem as CartItemType } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { MoneyInput } from "@/components/ui/Input";
import { usePDVStore } from "@/store/pdvStore";

interface CartItemProps {
  item: CartItemType;
}

export function CartItemRow({ item }: CartItemProps) {
  const { updateQuantity, updateUnitPrice, removeItem } = usePDVStore();

  function handleQtyChange(delta: number) {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    if (newQty > item.stockQuantity) return;
    updateQuantity(item.productId, newQty);
  }

  function handleQtyInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) return;
    if (val > item.stockQuantity) {
      updateQuantity(item.productId, item.stockQuantity);
      return;
    }
    updateQuantity(item.productId, val);
  }

  const atMax = item.quantity >= item.stockQuantity;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-card">
      {/* Header do item */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <span className="font-mono text-xs text-gray-400">{item.productCode}</span>
          <p className="font-medium text-gray-900 leading-tight">{item.productName}</p>
        </div>
        <button
          onClick={() => removeItem(item.productId)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
          title="Remover item"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Controles */}
      <div className="flex items-end gap-3">
        {/* Quantidade */}
        <div className="flex-shrink-0">
          <label className="text-xs text-gray-500 block mb-1">Quantidade</label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleQtyChange(-1)}
              disabled={item.quantity <= 1}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center
                text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors font-bold text-lg leading-none"
            >
              −
            </button>
            <input
              type="number"
              value={item.quantity}
              onChange={handleQtyInput}
              min="1"
              max={item.stockQuantity}
              className="w-12 text-center border border-gray-200 rounded-lg py-1.5 text-sm font-semibold
                text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={() => handleQtyChange(1)}
              disabled={atMax}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center
                text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors font-bold text-lg leading-none"
            >
              +
            </button>
          </div>
          {atMax && (
            <p className="text-[10px] text-amber-600 mt-0.5">Máx: {item.stockQuantity}</p>
          )}
        </div>

        {/* Valor unitário */}
        <div className="flex-1">
          <MoneyInput
            label="Valor unitário"
            value={item.unitPrice}
            onChange={(v) => updateUnitPrice(item.productId, v)}
          />
        </div>

        {/* Subtotal */}
        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-gray-500 mb-1">Subtotal</p>
          <p className="font-bold text-gray-900">{formatCurrency(item.subtotal)}</p>
        </div>
      </div>
    </div>
  );
}
