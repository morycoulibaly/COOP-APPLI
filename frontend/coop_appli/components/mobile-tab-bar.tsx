"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "../lib/nav-items";
import { useAuth } from "../lib/auth-context";

export function MobileTabBar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-stone-50 border-t border-stone-200 flex items-stretch z-40 px-1 py-1.5">
      {items.map((item) => {
        const actif = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 min-w-0"
          >
            <div
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl ${
                actif ? "bg-emerald-100" : ""
              }`}
            >
              <Icon size={20} className={actif ? "text-emerald-800" : "text-stone-400"} />
              <span
                className={`text-[11px] font-medium truncate ${
                  actif ? "text-emerald-800" : "text-stone-400"
                }`}
              >
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}