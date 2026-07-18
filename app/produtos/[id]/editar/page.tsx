import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductForm } from "@/components/products/ProductForm";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Editar Produto" };

interface Props {
  params: { id: string };
}

export default async function EditarProdutoPage({ params }: Props) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();

  // Serializa para cliente (converte Date para string)
  const serialized = {
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };

  return (
    <AppLayout>
      <ProductForm product={serialized} />
    </AppLayout>
  );
}
