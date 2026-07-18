import type { Metadata } from "next";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductForm } from "@/components/products/ProductForm";

export const metadata: Metadata = { title: "Novo Produto" };

export default function NovoProdutoPage() {
  return (
    <AppLayout>
      <ProductForm />
    </AppLayout>
  );
}
