"use client";

import { useAuth } from "../../../lib/auth-context";
import { UserAvatar } from "../../../components/user-avatar";

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-5">Mon profil</h1>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
          <div className="flex justify-center mb-4">
            <UserAvatar nom={user.nom} prenom={user.prenom} size={72} />
          </div>
          <p className="text-xl font-semibold text-slate-900">
            {user.prenom} {user.nom}
          </p>
          <p className="text-slate-500 mt-1">{user.telephone}</p>
          <p className="text-sm text-slate-400 mt-3 uppercase tracking-wide">
            {user.role === "ADMIN" ? "Administrateur" : "Adhérent"}
          </p>
        </div>
      </div>
    </div>
  );
}