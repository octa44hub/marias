import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { OfflineBanner } from "@/components/ui/OfflineBanner";

interface AppLayoutProps {
  children: React.ReactNode;
}

export async function AppLayout({ children }: AppLayoutProps) {
  // Verifica autenticação — roda em Node.js, sem limitação de Edge Runtime
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <OfflineBanner />
      <main className="flex-1 pb-nav md:pb-6">
        <div className="max-w-5xl mx-auto px-4 py-4">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
