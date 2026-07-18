"use client";

// Mantido para compatibilidade — Supabase Auth não precisa de provider
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
