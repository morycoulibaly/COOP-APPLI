import { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { MobileTabBar } from "./mobile-tab-bar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 pb-20 md:pb-0">{children}</main>
      </div>
      <MobileTabBar />
    </div>
  );
}