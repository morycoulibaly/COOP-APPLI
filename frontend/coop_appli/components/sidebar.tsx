"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { NAV_ITEMS } from "../lib/nav-items";
import { useAuth } from "../lib/auth-context";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  const contenu = (
    <nav className="flex flex-col gap-1 p-4">
      {items.map((item) => {
        const actif = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              actif
                ? "bg-emerald-600 text-white"
                : "text-zinc-300 hover:bg-emerald-950/50 hover:text-emerald-400"
            }`}
          >
            <Icon size={20} />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Sidebar fixe sur desktop */}
      <aside className="hidden md:block w-64 shrink-0 bg-zinc-950 border-r border-emerald-900/30 min-h-[calc(100vh-4rem)]">
        {contenu}
      </aside>

      {/* Drawer mobile */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-zinc-950 border-r border-emerald-900/30 shadow-xl">
            <div className="flex items-center justify-between px-4 h-16 border-b border-emerald-900/30">
              <span className="italic text-xl font-bold text-emerald-400">COOP'APPLI</span>
              <button
                onClick={onClose}
                className="text-emerald-400 hover:text-emerald-300 p-1"
                aria-label="Fermer le menu"
              >
                <X size={24} />
              </button>
            </div>
            {contenu}
          </aside>
        </div>
      )}
    </>
  );
}