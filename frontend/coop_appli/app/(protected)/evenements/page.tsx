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

// Suggestions "apprises" — se remplissent toutes seules à l'usage, stockées
// sur l'appareil de l'admin (pas partagées entre admins, pas de backend requis).
const CLE_NOMS_FREQUENTS = "coopappli_noms_frequents";
const CLE_MONTANTS_FREQUENTS = "coopappli_montants_frequents";
const MONTANTS_SUGGERES_PAR_DEFAUT = [200, 1000, 5000];
const MAX_SUGGESTIONS = 6;

type NomFrequent = { nom: string; montant: number };

function chargerListe<T>(cle: string, defaut: T[]): T[] {
  if (typeof window === "undefined") return defaut;
  try {
    const brut = window.localStorage.getItem(cle);
    return brut ? (JSON.parse(brut) as T[]) : defaut;
  } catch {
    return defaut;
  }
}

function sauvegarderListe<T>(cle: string, liste: T[]) {
  try {
    window.localStorage.setItem(cle, JSON.stringify(liste));
  } catch {
    // stockage indisponible (navigation privée, quota...) — on continue sans bloquer
  }
}

function dateDuJour(): string {
  return new Date().toISOString().split("T")[0];
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

  const [nomsFrequents, setNomsFrequents] = useState<NomFrequent[]>([]);
  const [montantsFrequents, setMontantsFrequents] = useState<number[]>(
    MONTANTS_SUGGERES_PAR_DEFAUT,
  );
  const aujourdHui = dateDuJour();

  useEffect(() => {
    setNomsFrequents(chargerListe<NomFrequent>(CLE_NOMS_FREQUENTS, []));
    setMontantsFrequents(
      chargerListe<number>(CLE_MONTANTS_FREQUENTS, MONTANTS_SUGGERES_PAR_DEFAUT),
    );
  }, []);

  function memoriserUsage(nomUtilise: string, montantUtilise: number) {
    setNomsFrequents((prev) => {
      const sansDoublon = prev.filter((item) => item.nom !== nomUtilise);
      const maj = [{ nom: nomUtilise, montant: montantUtilise }, ...sansDoublon].slice(
        0,
        MAX_SUGGESTIONS,
      );
      sauvegarderListe(CLE_NOMS_FREQUENTS, maj);
      return maj;
    });
    setMontantsFrequents((prev) => {
      const maj = Array.from(new Set([montantUtilise, ...prev])).slice(0, MAX_SUGGESTIONS);
      sauvegarderListe(CLE_MONTANTS_FREQUENTS, maj);
      return maj;
    });
  }

  function appliquerSuggestionNom(item: NomFrequent) {
    setNom(item.nom);
    setMontant(String(item.montant));
  }

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
    setErreur("");

    // Vérification côté client pour un retour immédiat — la vraie garantie
    // de sécurité reste côté backend (CreateEvenementDto), puisque n'importe
    // qui peut appeler l'API directement en contournant ce formulaire.
    if (dateEvenement < aujourdHui) {
      setErreur("La date de l'événement ne peut pas être antérieure à aujourd'hui.");
      return;
    }

    setEnvoiEnCours(true);
    try {
      await api.createEvenement({
        nom,
        description: description || undefined,
        montantCotisation: Number(montant),
        dateEvenement,
        dateLimitePaiement: dateLimite,
      });
      memoriserUsage(nom, Number(montant));
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
    <div className="pt-0 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: "var(--font-serif)" }}>Événements</h1>
          {user?.role === "ADMIN" && (
            <button
              onClick={() => setFormulaireOuvert((o) => !o)}
              className="text-base font-semibold bg-emerald-900 text-white px-4 py-2 rounded-xl hover:bg-emerald-800"
            >
              {formulaireOuvert ? "Annuler" : "+ Nouvel événement"}
            </button>
          )}
        </div>

        {formulaireOuvert && (
          <form
            onSubmit={handleCreation}
            className="bg-white rounded-2xl border border-stone-200 p-5 mb-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Nom</label>
              {nomsFrequents.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {nomsFrequents.map((item) => (
                    <button
                      key={item.nom}
                      type="button"
                      onClick={() => appliquerSuggestionNom(item)}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-stone-100 text-stone-700 border border-stone-300 hover:bg-stone-200"
                    >
                      {item.nom}
                    </button>
                  ))}
                </div>
              )}
              <input
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Description (optionnel)
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Montant de la cotisation (FCFA)
              </label>
              <input
                required
                type="number"
                min="1"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {montantsFrequents.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMontant(String(m))}
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      montant === String(m)
                        ? "bg-emerald-900 text-white border-emerald-900"
                        : "bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200"
                    }`}
                  >
                    {m.toLocaleString("fr-FR")} FCFA
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Date de l&apos;événement
                </label>
                <input
                  required
                  type="date"
                  min={aujourdHui}
                  value={dateEvenement}
                  onChange={(e) => setDateEvenement(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Date limite de paiement
                </label>
                <input
                  required
                  type="date"
                  min={aujourdHui}
                  value={dateLimite}
                  onChange={(e) => setDateLimite(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
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
          <p className="text-lg text-stone-500">Chargement...</p>
        ) : (
          <ul className="space-y-4">
            {evenements.map((ev) => (
              <li key={ev.id} className="bg-white rounded-2xl border border-stone-200 p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="text-lg font-semibold text-stone-900">{ev.nom}</h2>
                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full border ${
                      ev.statut === "OUVERT"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-stone-100 text-stone-600 border-stone-300"
                    }`}
                  >
                    {ev.statut === "OUVERT" ? "Ouvert" : "Clôturé"}
                  </span>
                </div>
                {ev.description && <p className="text-stone-600 mb-2">{ev.description}</p>}
                <p className="text-xl font-bold text-stone-900">{formaterMontant(ev.montantCotisation)}</p>
                <p className="text-sm text-stone-500 mt-1">
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