import { redirect } from "next/navigation";

// Sem autenticação — redireciona direto para o sistema
export default function LoginPage() {
  redirect("/dashboard");
}
