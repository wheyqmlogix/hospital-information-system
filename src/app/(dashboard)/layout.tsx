import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Protected } from "@/components/auth/protected";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Protected>
      <div className="flex h-screen bg-slate-50/50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
              {children}
            </div>
          </main>
        </div>
      </div>
    </Protected>
  );
}
