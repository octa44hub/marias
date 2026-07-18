import { create } from "zustand";
import { CartItem, PaymentMethod } from "@/types";

interface PDVState {
  items: CartItem[];
  discount: number; // centavos
  paymentMethod: PaymentMethod | null;
  installments: number;
  customerName: string;

  // Computed getters
  subtotal: () => number;
  total: () => number;

  // Actions
  addItem: (item: Omit<CartItem, "subtotal">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateUnitPrice: (productId: string, price: number) => void;
  setDiscount: (discount: number) => void;
  setPaymentMethod: (method: PaymentMethod | null) => void;
  setInstallments: (n: number) => void;
  setCustomerName: (name: string) => void;
  clearCart: () => void;
}

export const usePDVStore = create<PDVState>((set, get) => ({
  items: [],
  discount: 0,
  paymentMethod: null,
  installments: 1,
  customerName: "",

  subtotal: () => get().items.reduce((sum, item) => sum + item.subtotal, 0),
  total: () => Math.max(0, get().subtotal() - get().discount),

  addItem: (newItem) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === newItem.productId);

      if (existing) {
        // Aumenta a quantidade se já está no carrinho
        const newQty = Math.min(existing.quantity + 1, newItem.stockQuantity);
        return {
          items: state.items.map((i) =>
            i.productId === newItem.productId
              ? { ...i, quantity: newQty, subtotal: newQty * i.unitPrice }
              : i
          ),
        };
      }

      // Adiciona novo item
      return {
        items: [
          ...state.items,
          {
            ...newItem,
            quantity: 1,
            subtotal: newItem.unitPrice,
          },
        ],
      };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId
          ? { ...i, quantity, subtotal: quantity * i.unitPrice }
          : i
      ),
    }));
    // Ajusta desconto se ficar maior que o subtotal
    const { discount, subtotal } = get();
    if (discount > subtotal()) {
      set({ discount: subtotal() });
    }
  },

  updateUnitPrice: (productId, price) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId
          ? { ...i, unitPrice: price, subtotal: i.quantity * price }
          : i
      ),
    }));
  },

  setDiscount: (discount) => {
    const maxDiscount = get().subtotal();
    set({ discount: Math.min(discount, maxDiscount) });
  },

  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setInstallments: (n) => set({ installments: n }),
  setCustomerName: (name) => set({ customerName: name }),

  clearCart: () =>
    set({
      items: [],
      discount: 0,
      paymentMethod: null,
      installments: 1,
      customerName: "",
    }),
}));
