"use client";

import { useEffect, useState, FormEvent } from "react";
import { api, Evenement } from "../../../lib/api";
import { useAuth } from "../../../lib/auth-context";

function formaterMontant(montant: string): string {
  return `${Number(montant).toLocaleString("fr-FR")} FCFA`;
}

function formaterDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function EvenementsPage() {
  const { user } = useAuth();
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [montant, setMontant] = useState("");
  const [dateEvenement, setDateEvenement] = useState("");
  const [dateLimite, setDateLimite] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  function charger() {
    setChargement(true);
    api
      .getEvenements()
      .then(setEvenements)
      .catch((err) => setErreur(err instanceof Error ? err.message : "Erreur de chargement"))
      .finally(() => setChargement(false));
  }

  useEffect(charger, []);

  async function handleCreation(e: FormEvent) {
    e.preventDefault();
    setEnvoiEnCours(true);
    setErreur("");
    try {
      await api.createEvenement({
        nom,
        description: description || undefined,
        montantCotisation: Number(montant),
        dateEvenement,
        dateLimitePaiement: dateLimite,
      });
      setNom("");
      setDescription("");
      setMontant("");
      setDateEvenement("");
      setDateLimite("");
      setFormulaireOuvert(false);
      charger();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Impossible de créer l'événement");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-slate-900">Événements</h1>
          {user?.role === "ADMIN" && (
            <button
              onClick={() => setFormulaireOuvert((o) => !o)}
              className="text-base font-semibold bg-indigo-900 text-white px-4 py-2 rounded-xl hover:bg-indigo-800"
            >
              {formulaireOuvert ? "Annuler" : "+ Nouvel événement"}
            </button>
          )}
        </div>

        {formulaireOuvert && (
          <form
            onSubmit={handleCreation}
            className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
              <input
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description (optionnel)
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Montant de la cotisation (FCFA)
              </label>
              <input
                required
                type="number"
                min="1"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date de l'événement
                </label>
                <input
                  required
                  type="date"
                  value={dateEvenement}
                  onChange={(e) => setDateEvenement(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date limite de paiement
                </label>
                <input
                  required
                  type="date"
                  value={dateLimite}
                  onChange={(e) => setDateLimite(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={envoiEnCours}
              className="w-full text-base font-semibold bg-emerald-700 text-white py-3 rounded-xl hover:bg-emerald-800 disabled:opacity-60"
            >
              {envoiEnCours ? "Création..." : "Créer l'événement"}
            </button>
          </form>
        )}

        {erreur && (
          <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-base mb-4">
            {erreur}
          </p>
        )}

        {chargement ? (
          <p className="text-lg text-slate-500">Chargement...</p>
        ) : (
          <ul className="space-y-4">
            {evenements.map((ev) => (
              <li key={ev.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="text-lg font-semibold text-slate-900">{ev.nom}</h2>
                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full border ${
                      ev.statut === "OUVERT"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-slate-100 text-slate-600 border-slate-300"
                    }`}
                  >
                    {ev.statut === "OUVERT" ? "Ouvert" : "Clôturé"}
                  </span>
                </div>
                {ev.description && <p className="text-slate-600 mb-2">{ev.description}</p>}
                <p className="text-xl font-bold text-slate-900">{formaterMontant(ev.montantCotisation)}</p>
                <p className="text-sm text-slate-500 mt-1">
                  {formaterDate(ev.dateEvenement)} · échéance le {formaterDate(ev.dateLimitePaiement)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}