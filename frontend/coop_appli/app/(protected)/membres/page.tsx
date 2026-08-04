"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { api, Membre } from "../../../lib/api";
import { UserAvatar } from "../../../components/user-avatar";
import { Carte, EtatVide } from "../../../components/carte";

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
    <div>
      <h1 className="font-serif text-2xl font-bold text-[#23291F] mb-5">Membres de l&apos;amicale</h1>

      {chargement && <p className="text-lg text-[#5B6157]">Chargement...</p>}

      {erreur && (
        <p className="text-[#8A3128] bg-[#FAEAE8] border border-[#F0C9C4] rounded-lg px-4 py-3 text-base">
          {erreur}
        </p>
      )}

      {!chargement && !erreur && membres.length === 0 && (
        <EtatVide
          icon={Users}
          titre="Aucun membre à afficher"
          description="L'annuaire se remplira au fur et à mesure des inscriptions."
        />
      )}

      <ul>
        {membres.map((m) => (
          <li key={m.id}>
            <Carte>
              <div className="flex items-center gap-4">
                <UserAvatar nom={m.nom} prenom={m.prenom} size={48} />
                <div>
                  <p className="text-lg font-semibold text-[#23291F]">
                    {m.prenom} {m.nom}
                  </p>
                  <p className="text-[#5B6157]">{m.telephone}</p>
                </div>
              </div>
            </Carte>
          </li>
        ))}
      </ul>
    </div>
  );
}