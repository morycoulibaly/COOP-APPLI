"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { useAuth } from "../lib/auth-context";
import { NAV_ITEMS } from "../lib/nav-items"; // garde ta liste existante, filtrée par rôle

// Palette (à reporter dans tailwind.config si tu veux les réutiliser ailleurs) :
// papier   #FAF7F1   fond principal
// encre    #23291F   texte principal
// encre-2  #5B6157   texte secondaire
// foret    #1F6B4C   accent principal (nav active, boutons)
// ocre     #B8863B   accent secondaire (deuxième catégorie d'info)
// ligne    #E4DFD3   bordures

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAF7F1] flex flex-col">
      {/* Barre du haut — minimale, juste l'identité et le profil */}
      <header className="sticky top-0 z-10 bg-[#FAF7F1] border-b border-[#E4DFD3] px-5 py-4 flex items-center justify-between">
        <span className="font-serif text-xl font-bold text-[#1F6B4C]">
          COOP&apos;APPLI
        </span>
        <button
          onClick={logout}
          aria-label="Mon profil et déconnexion"
          className="w-10 h-10 rounded-full bg-[#1F6B4C] text-white flex items-center justify-center text-sm font-medium"
        >
          {user?.prenom?.[0]}
          {user?.nom?.[0]}
        </button>
      </header>

      {/* Contenu — colonne unique, padding généreux, espace pour la nav du bas */}
      <main className="flex-1 px-5 pt-5 pb-24 max-w-lg w-full mx-auto">
        {children}
      </main>

      {/* Navigation du bas — accessible au pouce, 4 items max, icône + libellé toujours */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E4DFD3] flex z-20"
        aria-label="Navigation principale"
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center gap-1 pt-2 pb-2.5 relative"
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <span className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-13 h-[3px] bg-[#1F6B4C] rounded-b" />
              )}
              <item.icon
                className="w-6 h-6"
                stroke={1.75}
                color={active ? "#1F6B4C" : "#8B8F85"}
              />
              <span
                className={`text-xs ${
                  active ? "text-[#1F6B4C] font-semibold" : "text-[#8B8F85]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}