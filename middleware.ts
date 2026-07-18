export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    /*
     * Protege todas as rotas EXCETO:
     * - /login (página de autenticação)
     * - /api/auth (rotas do NextAuth)
     * - /_next (arquivos estáticos do Next.js)
     * - /icons, /manifest.json, /sw.js (arquivos do PWA)
     * - /favicon.ico
     */
    "/((?!login|api/auth|_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|icons).*)",
  ],
};
