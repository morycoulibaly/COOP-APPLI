"use client";

import { useEffect, useState } from "react";
import { api, Cotisation } from "../../../lib/api";
import { useAuth } from "../../../lib/auth-context";

const LABELS_STATUT: Record<string, { label: string; classes: string }> = {
  PAYEE: { label: "Payée", classes: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  EN_ATTENTE: { label: "En attente", classes: "bg-amber-100 text-amber-800 border-amber-300" },
};

function formaterMontant(montant: string): string {
  return `${Number(montant).toLocaleString("fr-FR")} FCFA`;
}

export default function CotisationsAdminPage() {
  const { user } = useAuth();
  const [cotisations, setCotisations] = useState<Cotisation[]>([]);
  const [statutFiltre, setStatutFiltre] = useState("");
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [cotisationEnCours, setCotisationEnCours] = useState<string | null>(null);
  const [montantPaiement, setMontantPaiement] = useState("");
  const [moyenPaiement, setMoyenPaiement] = useState("ESPECES");

  function charger() {
    setChargement(true);
    api
      .getCotisationsAdmin(statutFiltre ? { statut: statutFiltre } : undefined)
      .then(setCotisations)
      .catch((err) => setErreur(err instanceof Error ? err.message : "Erreur de chargement"))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    if (user?.role === "ADMIN") charger();
  }, [statutFiltre, user]);

  async function handlePaiement(cotisationId: string) {
    try {
      await api.registerPaiement(cotisationId, {
        montant: Number(montantPaiement),
        moyenPaiement,
      });
      setCotisationEnCours(null);
      setMontantPaiement("");
      charger();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Impossible d'enregistrer le paiement");
    }
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center max-w-sm">
          <p className="text-lg text-slate-700">
            Cette page est réservée aux administrateurs de l'amicale.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-5">Suivi des cotisations</h1>

        <div className="flex gap-2 mb-5">
          {[
            { value: "", label: "Toutes" },
            { value: "EN_ATTENTE", label: "En attente" },
            { value: "PAYEE", label: "Payées" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatutFiltre(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                statutFiltre === opt.value
                  ? "bg-indigo-900 text-white border-indigo-900"
                  : "bg-white text-slate-600 border-slate-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {erreur && (
          <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-base mb-4">
            {erreur}
          </p>
        )}

        {chargement ? (
          <p className="text-lg text-slate-500">Chargement...</p>
        ) : (
          <ul className="space-y-3">
            {cotisations.map((c) => {
              const style = LABELS_STATUT[c.statut] ?? LABELS_STATUT.EN_ATTENTE;
              return (
                <li key={c.id} className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {c.user?.prenom} {c.user?.nom}
                      </p>
                      <p className="text-sm text-slate-500">{c.evenement.nom}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formaterMontant(c.montantDu)}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${style.classes}`}>
                        {style.label}
                      </span>
                    </div>
                  </div>

                  {c.statut !== "PAYEE" && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      {cotisationEnCours === c.id ? (
                        <div className="flex flex-wrap gap-2 items-center">
                          <input
                            type="number"
                            placeholder="Montant"
                            value={montantPaiement}
                            onChange={(e) => setMontantPaiement(e.target.value)}
                            className="w-28 px-2 py-1.5 border border-slate-300 rounded-lg text-sm"
                          />
                          <select
                            value={moyenPaiement}
                            onChange={(e) => setMoyenPaiement(e.target.value)}
                            className="px-2 py-1.5 border border-slate-300 rounded-lg text-sm"
                          >
                            <option value="ESPECES">Espèces</option>
                            <option value="CHEQUE">Chèque</option>
                            <option value="VIREMENT">Virement</option>
                            <option value="MOBILE_MONEY">Mobile Money</option>
                          </select>
                          <button
                            onClick={() => handlePaiement(c.id)}
                            className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800"
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() => setCotisationEnCours(null)}
                            className="px-3 py-1.5 text-slate-500 text-sm"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setCotisationEnCours(c.id);
                            setMontantPaiement(c.montantDu);
                          }}
                          className="text-sm font-medium text-indigo-900 underline"
                        >
                          Enregistrer un paiement
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}