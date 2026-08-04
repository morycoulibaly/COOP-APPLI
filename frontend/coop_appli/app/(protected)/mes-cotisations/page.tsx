"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { api, Cotisation } from "../../../lib/api";
import { Carte, EtatVide } from "../../../components/carte";

function statutAffiche(cotisation: Cotisation): "PAYEE" | "EN_RETARD" | "EN_ATTENTE" {
  if (cotisation.statut === "PAYEE") return "PAYEE";
  const enRetard = new Date(cotisation.dateEcheance) < new Date();
  return enRetard ? "EN_RETARD" : "EN_ATTENTE";
}

const STYLES_STATUT: Record<
  string,
  { label: string; accent: "vert" | "ocre" | "rouge"; classes: string }
> = {
  PAYEE: { label: "Payée", accent: "vert", classes: "bg-[#EAF3E8] text-[#1F6B4C]" },
  EN_ATTENTE: { label: "En attente", accent: "ocre", classes: "bg-[#FBF1E1] text-[#8A6427]" },
  EN_RETARD: { label: "En retard", accent: "rouge", classes: "bg-[#FAEAE8] text-[#8A3128]" },
};

function formaterMontant(montant: string): string {
  return `${Number(montant).toLocaleString("fr-FR")} FCFA`;
}

function formaterDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function MesCotisationsPage() {
  const [cotisations, setCotisations] = useState<Cotisation[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api
      .getMyCotisations()
      .then(setCotisations)
      .catch((err) => setErreur(err instanceof Error ? err.message : "Erreur de chargement"))
      .finally(() => setChargement(false));
  }, []);

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-[#23291F] mb-5">Mes cotisations</h1>

      {chargement && <p className="text-lg text-[#5B6157]">Chargement...</p>}

      {erreur && (
        <p className="text-[#8A3128] bg-[#FAEAE8] border border-[#F0C9C4] rounded-lg px-4 py-3 text-base mb-4">
          {erreur}
        </p>
      )}

      {!chargement && !erreur && cotisations.length === 0 && (
        <EtatVide
          icon={Wallet}
          titre="Aucune cotisation pour le moment"
          description="Tes cotisations apparaîtront ici dès qu'un événement te concernera."
        />
      )}

      <ul>
        {cotisations.map((cotisation) => {
          const statut = statutAffiche(cotisation);
          const style = STYLES_STATUT[statut];
          return (
            <li key={cotisation.id}>
              <Carte accent={style.accent}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="text-lg font-semibold text-[#23291F]">
                    {cotisation.evenement.nom}
                  </h2>
                  <span
                    className={`shrink-0 text-sm font-medium px-3 py-1 rounded-full ${style.classes}`}
                  >
                    {style.label}
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#23291F] mb-1">
                  {formaterMontant(cotisation.montantDu)}
                </p>
                <p className="text-base text-[#5B6157]">
                  {statut === "PAYEE" ? "Réglée" : "Échéance"} :{" "}
                  {formaterDate(cotisation.dateEcheance)}
                </p>
              </Carte>
            </li>
          );
        })}
      </ul>
    </div>
  );
}