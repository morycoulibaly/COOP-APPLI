"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Membre } from "../../../lib/api";
import { UserAvatar } from "../../../components/user-avatar";

export default function MembresPage() {
  const [membres, setMembres] = useState<Membre[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api
      .getMembers()
      .then(setMembres)
      .catch((err) => setErreur(err instanceof Error ? err.message : "Erreur de chargement"))
      .finally(() => setChargement(false));
  }, []);

  return (
    <div className="pt-0 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-stone-900 mb-5" style={{ fontFamily: "var(--font-serif)" }}>Membres de l'amicale</h1>

        {chargement && <p className="text-lg text-stone-500">Chargement...</p>}
        {erreur && (
          <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-base">
            {erreur}
          </p>
        )}

        <ul className="space-y-3">
          {membres.map((m) => (
            <li key={m.id}>
              <Link
                href={`/membres/${m.id}`}
                className="bg-white rounded-2xl border border-stone-200 p-4 flex items-center gap-4 hover:border-emerald-400 transition-colors"
              >
                <UserAvatar nom={m.nom} prenom={m.prenom} photoUrl={m.photoUrl} size={48} />
                <div>
                  <p className="text-lg font-semibold text-stone-900">
                    {m.prenom} {m.nom}
                  </p>
                  <p className="text-stone-500">{m.telephone}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}