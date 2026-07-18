"use client";

import { useState, useRef, useEffect } from "react";
import { Product, getStockStatus } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface ProductSearchProps {
  onSelect: (product: Product) => void;
}

export function ProductSearch({ onSelect }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.slice(0, 8)); // máximo 8 sugestões
        setOpen(true);
        setActiveIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  function handleSelect(product: Product) {
    onSelect(product);
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Digite o código ou nome do produto..."
          autoComplete="off"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900
            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500
            focus:border-transparent text-base shadow-sm"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown de sugestões */}
      {open && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-30 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
        >
          {results.map((product, idx) => {
            const status = getStockStatus(product);
            const isInactive = product.status === "INACTIVE";
            const isOut = status === "out_of_stock";

            return (
              <button
                key={product.id}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(product); }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-left transition-colors",
                  "border-b border-gray-50 last:border-0",
                  idx === activeIndex ? "bg-primary-50" : "hover:bg-gray-50",
                  (isInactive || isOut) && "opacity-60"
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-500">{product.code}</span>
                    {isInactive && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                        Inativo
                      </span>
                    )}
                    {!isInactive && isOut && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                        Esgotado
                      </span>
                    )}
                    {!isInactive && status === "low_stock" && (
                      <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-medium">
                        Estoque baixo
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                </div>
                <div className="flex-shrink-0 text-right ml-4">
                  <p className="font-semibold text-gray-900 text-sm">{formatCurrency(product.price)}</p>
                  <p className="text-xs text-gray-500">Estoque: {product.quantity}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {open && query && !loading && results.length === 0 && (
        <div className="absolute z-30 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-6 text-center">
          <p className="text-gray-500 text-sm">Nenhum produto encontrado para "<strong>{query}</strong>"</p>
        </div>
      )}
    </div>
  );
}
