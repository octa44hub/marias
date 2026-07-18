import type { Metadata } from "next";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductList } from "@/components/products/ProductList";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Produtos" };

export default function ProdutosPage() {
  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Produtos</h1>
        <Link href="/produtos/novo">
          <Button size="md">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Novo produto
          </Button>
        </Link>
      </div>
      <ProductList />
    </AppLayout>
  );
}
