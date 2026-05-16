"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Protected } from "@/components/auth/protected";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Protected>
      <div className="flex h-screen bg-white overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 w-full bg-[#fcfcfc] pb-20 lg:pb-8 pt-6 lg:pt-8">
            <div className="max-w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </Protected>
  );
}
