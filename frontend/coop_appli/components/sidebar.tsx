"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "../lib/nav-items";
import { useAuth } from "../lib/auth-context";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  return (
    <aside className="hidden md:block w-64 shrink-0 bg-stone-50 border-r border-stone-200 min-h-[calc(100vh-4rem)]">
      <nav className="flex flex-col gap-1 p-4">
        {items.map((item) => {
          const actif = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                actif
                  ? "bg-emerald-100 text-emerald-900 font-semibold"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}