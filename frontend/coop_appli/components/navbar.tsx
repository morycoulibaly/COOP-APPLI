"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { UserAvatar } from "./user-avatar";

export function Navbar() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <nav className="bg-stone-50 border-b border-stone-200 px-4 h-16 flex items-center justify-between sticky top-0 z-40">
      <Link
        href="/"
        className="text-xl md:text-2xl font-bold text-stone-900"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        COOP'APPLI
      </Link>

      {user && (
        <button
          onClick={() => router.push("/profile")}
          aria-label="Mon profil"
          className="rounded-full hover:ring-2 hover:ring-emerald-700 transition-all"
        >
          <UserAvatar nom={user.nom} prenom={user.prenom} photoUrl={user.photoUrl} />
        </button>
      )}
    </nav>
  );
}