"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { formatDate } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
  bazarName?: string;
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Início",
  "/pdv": "PDV",
  "/produtos": "Produtos",
  "/produtos/novo": "Novo Produto",
  "/relatorios": "Relatório de Vendas",
};

export function Header({ bazarName = "Maria's Confecções" }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const title = PAGE_TITLES[pathname] || bazarName;
  const today = formatDate(new Date());

  async function handleLogout() {
    if (!confirmLogout) {
      setConfirmLogout(true);
      setTimeout(() => setConfirmLogout(false), 3000);
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <header className="no-print sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Esquerda: logo + título */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex-shrink-0">
            <div className="w-8 h-8 bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Maria's Confecções"
                width={32}
                height={32}
                className="object-contain p-0.5"
              />
            </div>
          </Link>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-gray-900 leading-tight">{title}</span>
            <span className="text-xs text-gray-400 leading-tight hidden sm:block">{today}</span>
          </div>
        </div>

        {/* Direita: links desktop + logout */}
        <div className="flex items-center gap-1">
          {/* Navegação desktop */}
          <nav className="hidden md:flex items-center gap-1 mr-2">
            <NavLink href="/dashboard">Início</NavLink>
            <NavLink href="/pdv">PDV</NavLink>
            <NavLink href="/produtos">Produtos</NavLink>
            <NavLink href="/relatorios">Relatório</NavLink>
          </nav>

          {/* Botão sair */}
          <button
            onClick={handleLogout}
            title={confirmLogout ? "Clique novamente para sair" : "Sair do sistema"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              confirmLogout
                ? "bg-red-100 text-red-700 font-semibold"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">{confirmLogout ? "Confirmar saída?" : "Sair"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary-50 text-primary-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}
