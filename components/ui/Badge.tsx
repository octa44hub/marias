import { cn } from "@/lib/utils";
import { StockStatus, STOCK_STATUS_LABELS, SaleStatus, SALE_STATUS_LABELS } from "@/types";

type BadgeVariant = "gray" | "green" | "yellow" | "red" | "blue" | "purple";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  gray: "bg-gray-100 text-gray-700",
  green: "bg-green-100 text-green-700",
  yellow: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-primary-100 text-primary-700",
};

export function Badge({ variant = "gray", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ─── Badges específicos ───────────────────────────────────────────────────────

const stockVariants: Record<StockStatus, BadgeVariant> = {
  in_stock: "green",
  low_stock: "yellow",
  out_of_stock: "red",
  inactive: "gray",
};

export function StockBadge({ status }: { status: StockStatus }) {
  return (
    <Badge variant={stockVariants[status]}>
      {STOCK_STATUS_LABELS[status]}
    </Badge>
  );
}

export function SaleStatusBadge({ status }: { status: SaleStatus }) {
  return (
    <Badge variant={status === "COMPLETED" ? "green" : "red"}>
      {SALE_STATUS_LABELS[status]}
    </Badge>
  );
}
