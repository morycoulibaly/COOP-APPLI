"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Evenement, Cotisation } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";

function formaterDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function formaterMontant(montant: string): string {
  return `${Number(montant).toLocaleString("fr-FR")} FCFA`;
}

export default function AccueilPage() {
  const { user } = useAuth();

  if (user?.role === "ADMIN") return <AccueilAdmin />;
  return <AccueilAdherent />;
}

function AccueilAdmin() {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [cotisations, setCotisations] = useState<Cotisation[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    Promise.all([api.getEvenements(), api.getCotisationsAdmin()])
      .then(([ev, cot]) => {
        setEvenements(ev);
        setCotisations(cot);
      })
      .catch((err) => setErreur(err instanceof Error ? err.message : "Erreur de chargement"))
      .finally(() => setChargement(false));
  }, []);

  const evenementsOuverts = evenements.filter((e) => e.statut === "OUVERT");
  const montantEnAttente = cotisations
    .filter((c) => c.statut !== "PAYEE")
    .reduce((total, c) => total + Number(c.montantDu), 0);

  return (
    <div className="px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <h1
          className="text-2xl font-bold text-stone-900 mb-5"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Tableau de bord
        </h1>

        {chargement && <p className="text-lg text-stone-500">Chargement...</p>}
        {erreur && (
          <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            {erreur}
          </p>
        )}

        {!chargement && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-2xl border border-stone-200 p-5">
                <p className="text-sm text-stone-500">Événements ouverts</p>
                <p className="text-3xl font-bold text-stone-900 mt-1">{evenementsOuverts.length}</p>
              </div>
              <div className="bg-emerald-950 text-white rounded-2xl p-5">
                <p className="text-sm text-emerald-200">Reste à collecter</p>
                <p className="text-2xl font-bold mt-1">{formaterMontant(String(montantEnAttente))}</p>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-stone-900 mb-3">Suivi par événement</h2>
            <ul className="space-y-3">
              {evenementsOuverts.map((ev) => {
                const cotisationsEvenement = cotisations.filter((c) => c.evenement.id === ev.id);
                const payees = cotisationsEvenement.filter((c) => c.statut === "PAYEE").length;
                const total = cotisationsEvenement.length;
                return (
                  <li key={ev.id} className="bg-white rounded-2xl border border-stone-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-stone-900">{ev.nom}</p>
                      <span className="text-sm font-medium text-stone-600">
                        {payees}/{total} ont payé
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 mt-2">
                      <div
                        className="bg-emerald-700 h-2 rounded-full"
                        style={{ width: total > 0 ? `${(payees / total) * 100}%` : "0%" }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function AccueilAdherent() {
  const { user } = useAuth();
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

  const enAttente = cotisations.filter((c) => c.statut !== "PAYEE");
  const aJour = enAttente.length === 0 && cotisations.length > 0;
  const totalVerse = cotisations.reduce((total, c) => {
    // montantDu = ce qu'il reste à payer ; on ne connaît pas le montant déjà
    // versé directement ici, seulement si la cotisation est soldée ou non.
    return c.statut === "PAYEE" ? total + 1 : total;
  }, 0);

  return (
    <div className="px-4 py-6">
      <div className="max-w-md mx-auto">
        <h1
          className="text-2xl font-bold text-stone-900 mb-1"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Bienvenue, {user?.prenom}.
        </h1>
        <p className="text-stone-500 mb-6">
          Ton tableau de bord récapitule l'état de tes cotisations.
        </p>

        {chargement && <p className="text-lg text-stone-500">Chargement...</p>}
        {erreur && (
          <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{erreur}</p>
        )}

        {!chargement && !erreur && (
          <>
            <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${aJour ? "bg-emerald-600" : "bg-amber-500"}`}
                />
                <h2 className="font-semibold text-stone-900">Statut de mes cotisations</h2>
              </div>
              <span
                className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${
                  aJour ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                {aJour ? "À jour" : `${enAttente.length} en attente`}
              </span>
              <p className="text-stone-600 mt-3">
                {aJour
                  ? "Toutes tes cotisations sont réglées. Merci pour ta fidélité à l'amicale."
                  : "Le trésorier enregistre ton paiement dès réception — en espèces, chèque ou virement."}
              </p>
              <Link
                href="/mes-cotisations"
                className="block text-center mt-4 bg-emerald-900 text-white py-3 rounded-xl font-medium hover:bg-emerald-800"
              >
                Voir le détail →
              </Link>
            </div>

            <div className="bg-emerald-950 text-white rounded-2xl p-5 mb-4">
              <p className="text-emerald-200 text-sm">Cotisations réglées</p>
              <p className="text-3xl font-bold mt-1">
                {totalVerse} / {cotisations.length}
              </p>
              <p className="text-emerald-300 text-sm mt-1">Depuis ton inscription à l'amicale</p>
            </div>

            <h2 className="text-lg font-semibold text-stone-900 mb-3">Événements récents</h2>
            <EvenementsRecents />
          </>
        )}
      </div>
    </div>
  );
}

function EvenementsRecents() {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api
      .getEvenements()
      .then((ev) => setEvenements(ev.slice(0, 3)))
      .finally(() => setChargement(false));
  }, []);

  if (chargement) return <p className="text-stone-500">Chargement...</p>;
  if (evenements.length === 0) return <p className="text-stone-500">Aucun événement pour le moment.</p>;

  return (
    <ul className="space-y-3">
      {evenements.map((ev) => (
        <li key={ev.id} className="bg-white rounded-2xl border border-stone-200 p-4">
          <p className="font-semibold text-stone-900">{ev.nom}</p>
          <p className="text-sm text-stone-500 mt-1">{formaterDate(ev.dateEvenement)}</p>
        </li>
      ))}
    </ul>
  );
}