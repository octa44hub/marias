"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { formatDate } from "@/lib/formatters";

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
  const title = PAGE_TITLES[pathname] || bazarName;
  const today = formatDate(new Date());

  return (
    <header className="no-print sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between h-14 px-4">
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

        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/dashboard">Início</NavLink>
          <NavLink href="/pdv">PDV</NavLink>
          <NavLink href="/produtos">Produtos</NavLink>
          <NavLink href="/relatorios">Relatório</NavLink>
        </nav>
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
