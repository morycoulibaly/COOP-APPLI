"use client";

import { useEffect, useState } from "react";
import { api, Cotisation } from "../../../lib/api";

function statutAffiche(cotisation: Cotisation): "PAYEE" | "EN_RETARD" | "EN_ATTENTE" {
  if (cotisation.statut === "PAYEE") return "PAYEE";
  const enRetard = new Date(cotisation.dateEcheance) < new Date();
  return enRetard ? "EN_RETARD" : "EN_ATTENTE";
}

const STYLES_STATUT: Record<string, { label: string; classes: string }> = {
  PAYEE: { label: "Payée", classes: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  EN_ATTENTE: { label: "En attente", classes: "bg-amber-100 text-amber-800 border-amber-300" },
  EN_RETARD: { label: "En retard", classes: "bg-red-100 text-red-800 border-red-300" },
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
    <div className="pt-0 px-4 py-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-stone-900 mb-5" style={{ fontFamily: "var(--font-serif)" }}>Mes cotisations</h1>

        {chargement && <p className="text-lg text-stone-500">Chargement...</p>}

        {erreur && (
          <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-base">
            {erreur}
          </p>
        )}

        {!chargement && !erreur && cotisations.length === 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center">
            <p className="text-lg text-stone-600">Tu n'as aucune cotisation pour le moment.</p>
          </div>
        )}

        <ul className="space-y-4">
          {cotisations.map((cotisation) => {
            const statut = statutAffiche(cotisation);
            const style = STYLES_STATUT[statut];
            return (
              <li
                key={cotisation.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="text-lg font-semibold text-stone-900">
                    {cotisation.evenement.nom}
                  </h2>
                  <span
                    className={`shrink-0 text-sm font-medium px-3 py-1 rounded-full border ${style.classes}`}
                  >
                    {style.label}
                  </span>
                </div>
                <p className="text-2xl font-bold text-stone-900 mb-1">
                  {formaterMontant(cotisation.montantDu)}
                </p>
                <p className="text-base text-stone-500">
                  {statut === "PAYEE" ? "Réglée" : "Échéance"} :{" "}
                  {formaterDate(cotisation.dateEcheance)}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}