"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input, MoneyInput } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

interface ProductFormProps {
  product?: Product; // se fornecido, modo edição
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const isEditing = !!product;

  const [code, setCode] = useState(product?.code || "");
  const [name, setName] = useState(product?.name || "");
  const [quantity, setQuantity] = useState(String(product?.quantity ?? ""));
  const [price, setPrice] = useState(product?.price ?? 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!code.trim()) newErrors.code = "Código é obrigatório";
    else if (!/^[a-zA-Z0-9]+$/.test(code.trim()))
      newErrors.code = "Use apenas letras e números";

    if (!name.trim()) newErrors.name = "Nome é obrigatório";

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) newErrors.quantity = "Informe uma quantidade válida (0 ou mais)";

    if (price <= 0) newErrors.price = "O valor deve ser maior que R$ 0,00";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || loading) return;

    setLoading(true);
    try {
      const body = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        quantity: parseInt(quantity, 10),
        price,
      };

      const url = isEditing ? `/api/products/${product.id}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || "Erro ao salvar produto");
        return;
      }

      success(isEditing ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!");
      router.push("/produtos");
      router.refresh();
    } catch {
      showError("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card padding="lg" className="max-w-lg mx-auto">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        {isEditing ? "Editar Produto" : "Novo Produto"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Código */}
        <Input
          label="Código do produto *"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (errors.code) setErrors((p) => ({ ...p, code: "" }));
          }}
          placeholder="Ex: 001, CAM01, CALCA10"
          error={errors.code}
          hint="Letras e números. Deve ser único."
          disabled={loading}
          autoFocus={!isEditing}
        />

        {/* Nome */}
        <Input
          label="Nome do produto *"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((p) => ({ ...p, name: "" }));
          }}
          placeholder="Ex: Camiseta Estampada"
          error={errors.name}
          disabled={loading}
        />

        {/* Quantidade */}
        <Input
          label="Quantidade em estoque *"
          type="number"
          inputMode="numeric"
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value);
            if (errors.quantity) setErrors((p) => ({ ...p, quantity: "" }));
          }}
          placeholder="0"
          min="0"
          step="1"
          error={errors.quantity}
          hint="Número inteiro, mínimo 0"
          disabled={loading}
        />

        {/* Valor */}
        <MoneyInput
          label="Valor unitário *"
          value={price}
          onChange={(v) => {
            setPrice(v);
            if (errors.price) setErrors((p) => ({ ...p, price: "" }));
          }}
          error={errors.price}
          hint="Valor que será usado no PDV"
          disabled={loading}
        />

        {/* Botões */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={loading}
            fullWidth
          >
            Cancelar
          </Button>
          <Button type="submit" loading={loading} fullWidth>
            {isEditing ? "Salvar alterações" : "Cadastrar produto"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
