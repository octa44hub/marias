import { NextRequest, NextResponse } from "next/server";

// Middleware simples: verifica apenas se o cookie de sessão do Supabase existe.
// Sem chamadas de rede — compatível com Edge Runtime da Vercel.
// A validação real do token acontece nas API routes (Node.js).
export function middleware(req: NextRequest) {
  const isAuthenticated = req.cookies.getAll().some(
    (c) => c.name.includes("-auth-token")
  );

  if (!isAuthenticated && !req.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|icons).*)",
  ],
};
