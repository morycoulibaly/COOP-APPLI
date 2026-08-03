"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, ChevronDown, User as UserIcon, LogOut } from "lucide-react";
import { useAuth } from "../lib/auth-context";
import { UserAvatar } from "./user-avatar";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fermerSiExterieur(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOuvert(false);
      }
    }
    document.addEventListener("mousedown", fermerSiExterieur);
    return () => document.removeEventListener("mousedown", fermerSiExterieur);
  }, []);

  return (
    <nav className="bg-zinc-950 border-b border-emerald-900/30 px-4 h-16 flex items-center justify-between sticky top-0 z-40">
      {/* Partie gauche : logo (desktop) / hamburger (mobile) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-emerald-400 hover:text-emerald-300 p-1"
          aria-label="Ouvrir le menu"
        >
          <Menu size={26} />
        </button>
        <Link href="/" className="hidden md:block italic text-2xl font-bold text-emerald-400">
          COOP'APPLI
        </Link>
      </div>

      {/* Logo centré sur mobile, à la place du hamburger côté droit */}
      <Link href="/" className="md:hidden italic text-xl font-bold text-emerald-400">
        COOP'APPLI
      </Link>

      {/* Partie droite : avatar + menu déroulant */}
      {user && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOuvert((o) => !o)}
            className="flex items-center gap-2 hover:bg-emerald-950/50 rounded-full pr-2 pl-1 py-1 transition-colors"
            aria-label="Menu utilisateur"
            aria-expanded={menuOuvert}
          >
            <UserAvatar nom={user.nom} prenom={user.prenom} />
            <ChevronDown
              size={18}
              className={`text-emerald-400 transition-transform ${menuOuvert ? "rotate-180" : ""}`}
            />
          </button>

          {menuOuvert && (
            <div className="absolute right-0 mt-2 w-56 bg-zinc-950 border border-emerald-900/30 rounded-xl shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-emerald-900/30">
                <p className="text-white font-medium truncate">
                  {user.prenom} {user.nom}
                </p>
                <p className="text-zinc-500 text-sm truncate">{user.telephone}</p>
              </div>
              <Link
                href="/profile"
                onClick={() => setMenuOuvert(false)}
                className="flex items-center gap-3 px-4 py-3 text-zinc-200 hover:bg-emerald-950/50 transition-colors"
              >
                <UserIcon size={18} className="text-emerald-400" />
                Mon profil
              </Link>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 text-zinc-200 hover:bg-emerald-950/50 transition-colors text-left"
              >
                <LogOut size={18} className="text-emerald-400" />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}