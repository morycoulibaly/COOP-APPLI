"use client";

import { useEffect, useState, FormEvent } from "react";
import { CalendarDays } from "lucide-react";
import { api, Evenement } from "../../../lib/api";
import { useAuth } from "../../../lib/auth-context";
import { Carte, EtatVide } from "../../../components/carte";

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
    <div>
      <div className="flex items-center justify-between mb-5 gap-3">
        <h1 className="font-serif text-2xl font-bold text-[#23291F]">Événements</h1>
        {user?.role === "ADMIN" && (
          <button
            onClick={() => setFormulaireOuvert((o) => !o)}
            className="text-base font-semibold bg-[#1F6B4C] text-white px-4 py-2.5 rounded-xl shrink-0"
          >
            {formulaireOuvert ? "Annuler" : "+ Nouvel événement"}
          </button>
        )}
      </div>

      {formulaireOuvert && (
        <form
          onSubmit={handleCreation}
          className="bg-white rounded-xl border border-[#E4DFD3] p-5 mb-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-[#23291F] mb-1">Nom</label>
            <input
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#E4DFD3] rounded-lg text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#23291F] mb-1">
              Description (optionnel)
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#E4DFD3] rounded-lg text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#23291F] mb-1">
              Montant de la cotisation (FCFA)
            </label>
            <input
              required
              type="number"
              min="1"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#E4DFD3] rounded-lg text-base"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#23291F] mb-1">
                Date de l&apos;événement
              </label>
              <input
                required
                type="date"
                value={dateEvenement}
                onChange={(e) => setDateEvenement(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E4DFD3] rounded-lg text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#23291F] mb-1">
                Date limite de paiement
              </label>
              <input
                required
                type="date"
                value={dateLimite}
                onChange={(e) => setDateLimite(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E4DFD3] rounded-lg text-base"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={envoiEnCours}
            className="w-full text-base font-semibold bg-[#1F6B4C] text-white py-3 rounded-xl disabled:opacity-60"
          >
            {envoiEnCours ? "Création..." : "Créer l'événement"}
          </button>
        </form>
      )}

      {erreur && (
        <p className="text-[#8A3128] bg-[#FAEAE8] border border-[#F0C9C4] rounded-lg px-4 py-3 text-base mb-4">
          {erreur}
        </p>
      )}

      {chargement && <p className="text-lg text-[#5B6157]">Chargement...</p>}

      {!chargement && !erreur && evenements.length === 0 && (
        <EtatVide
          icon={CalendarDays}
          titre="Aucun événement prévu"
          description={
            user?.role === "ADMIN"
              ? "Crée le premier événement pour commencer à collecter les cotisations."
              : "Reviens bientôt — les prochains événements de l'amicale s'afficheront ici."
          }
          actionLabel={user?.role === "ADMIN" ? "Créer un événement" : undefined}
          onAction={user?.role === "ADMIN" ? () => setFormulaireOuvert(true) : undefined}
        />
      )}

      <ul>
        {evenements.map((ev) => (
          <li key={ev.id}>
            <Carte accent={ev.statut === "OUVERT" ? "vert" : "ocre"}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="text-lg font-semibold text-[#23291F]">{ev.nom}</h2>
                <span
                  className={`shrink-0 text-sm font-medium px-3 py-1 rounded-full ${
                    ev.statut === "OUVERT"
                      ? "bg-[#EAF3E8] text-[#1F6B4C]"
                      : "bg-[#F1EFE8] text-[#5B6157]"
                  }`}
                >
                  {ev.statut === "OUVERT" ? "Ouvert" : "Clôturé"}
                </span>
              </div>
              {ev.description && <p className="text-[#5B6157] mb-2">{ev.description}</p>}
              <p className="text-xl font-bold text-[#23291F]">{formaterMontant(ev.montantCotisation)}</p>
              <p className="text-sm text-[#5B6157] mt-1">
                {formaterDate(ev.dateEvenement)} · échéance le {formaterDate(ev.dateLimitePaiement)}
              </p>
            </Carte>
          </li>
        ))}
      </ul>
    </div>
  );
}