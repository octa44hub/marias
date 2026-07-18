import { ProductStatus, PaymentMethod, SaleStatus } from "@prisma/client";

// Re-exporta os enums do Prisma para uso no frontend
export { ProductStatus, PaymentMethod, SaleStatus };

// ─── Produto ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  code: string;
  name: string;
  quantity: number;
  price: number; // centavos
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

// Status visual calculado no frontend
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "inactive";

export function getStockStatus(product: Pick<Product, "quantity" | "status">): StockStatus {
  if (product.status === ProductStatus.INACTIVE) return "inactive";
  if (product.quantity === 0) return "out_of_stock";
  if (product.quantity <= 3) return "low_stock";
  return "in_stock";
}

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  in_stock: "Em estoque",
  low_stock: "Estoque baixo",
  out_of_stock: "Esgotado",
  inactive: "Inativo",
};

// ─── PDV / Carrinho ───────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;    // centavos — pode ser editado pelo operador
  stockQuantity: number; // estoque disponível no momento
  subtotal: number;     // quantity * unitPrice
}

// ─── Venda ────────────────────────────────────────────────────────────────────

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;  // centavos
  subtotal: number;   // centavos
  createdAt: string;
}

export interface Sale {
  id: string;
  saleNumber: string;
  subtotal: number;   // centavos
  discount: number;   // centavos
  total: number;      // centavos
  paymentMethod: PaymentMethod;
  installments: number | null;
  customerName: string | null;
  status: SaleStatus;
  createdAt: string;
  cancelledAt: string | null;
  items: SaleItem[];
}

// ─── Formulários ─────────────────────────────────────────────────────────────

export interface ProductFormData {
  code: string;
  name: string;
  quantity: number;
  price: number; // centavos
}

export interface SaleFormData {
  items: {
    productId: string;
    productCode: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  discount: number;
  paymentMethod: PaymentMethod;
  installments?: number;
  customerName?: string;
}

// ─── Mapeamento de labels para exibição ──────────────────────────────────────

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Dinheiro",
  PIX: "Pix",
  DEBIT_CARD: "Cartão de débito",
  CREDIT_CARD: "Cartão de crédito",
  CREDIT_ACCOUNT: "Fiado",
};

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  COMPLETED: "Finalizada",
  CANCELLED: "Cancelada",
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  revenueToday: number;    // centavos
  revenueMonth: number;    // centavos
  totalProducts: number;
  totalUnits: number;
  salesToday: number;
  salesMonth: number;
}

// ─── Relatório ────────────────────────────────────────────────────────────────

export interface ReportSummary {
  totalRevenue: number;      // centavos
  totalSales: number;
  totalUnits: number;
  totalDiscounts: number;    // centavos
  averageTicket: number;     // centavos
}

export type ReportPeriod = "today" | "week" | "month" | "custom";

export interface ReportFilters {
  period: ReportPeriod;
  startDate?: string; // ISO
  endDate?: string;   // ISO
  paymentMethod?: PaymentMethod;
  customerName?: string;
  productSearch?: string;
}

// ─── Resposta da API ──────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
}
