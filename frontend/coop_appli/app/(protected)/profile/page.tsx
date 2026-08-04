"use client";

import { useAuth } from "../../../lib/auth-context";
import { UserAvatar } from "../../../components/user-avatar";
import { Carte } from "../../../components/carte";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-[#23291F] mb-5">Mon profil</h1>

      <Carte>
        <div className="text-center py-2">
          <div className="flex justify-center mb-4">
            <UserAvatar nom={user.nom} prenom={user.prenom} size={72} />
          </div>
          <p className="text-xl font-semibold text-[#23291F]">
            {user.prenom} {user.nom}
          </p>
          <p className="text-[#5B6157] mt-1">{user.telephone}</p>
          <p className="text-sm text-[#8B8F85] mt-3 uppercase tracking-wide">
            {user.role === "ADMIN" ? "Administrateur" : "Adhérent"}
          </p>
        </div>
      </Carte>

      <button
        onClick={logout}
        className="w-full text-base font-semibold text-[#8A3128] bg-[#FAEAE8] border border-[#F0C9C4] py-3 rounded-xl mt-4"
      >
        Se déconnecter
      </button>
    </div>
  );
}