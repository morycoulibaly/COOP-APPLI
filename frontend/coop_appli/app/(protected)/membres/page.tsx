"use client";

import { useEffect, useState, FormEvent } from "react";
import { Users, ShieldCheck } from "lucide-react";
import { api, Membre, UtilisateurAdmin } from "../../../lib/api";
import { useAuth } from "../../../lib/auth-context";
import { UserAvatar } from "../../../components/user-avatar";

type FiltreRole = "" | "ADHERENT" | "ADMIN";
type ActionEnAttente = { id: string; type: "promouvoir" | "desactiver" } | null;

export default function MembresPage() {
  const { user } = useAuth();
  const estAdmin = user?.role === "ADMIN";

  // Deux sources de données selon le rôle : l'annuaire public (Membre, sans
  // statut actif/inactif) pour un adhérent, la vue complète (UtilisateurAdmin)
  // pour un admin qui a besoin de filtrer et d'agir sur les comptes.
  const [membres, setMembres] = useState<Membre[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<UtilisateurAdmin[]>([]);
  const [filtre, setFiltre] = useState<FiltreRole>("");
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState<string | null>(null);
  const [actionEnAttente, setActionEnAttente] = useState<ActionEnAttente>(null);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  function charger() {
    setChargement(true);
    setErreur("");
    if (estAdmin) {
      api
        .getUsersAdmin(filtre || undefined)
        .then(setUtilisateurs)
        .catch((err) => setErreur(err instanceof Error ? err.message : "Erreur de chargement"))
        .finally(() => setChargement(false));
    } else {
      api
        .getMembers()
        .then(setMembres)
        .catch((err) => setErreur(err instanceof Error ? err.message : "Erreur de chargement"))
        .finally(() => setChargement(false));
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(charger, [estAdmin, filtre]);

  async function handleCreationAdmin(e: FormEvent) {
    e.preventDefault();
    setErreur("");
    setEnvoiEnCours(true);
    try {
      await api.createAdmin({ nom, prenom, telephone, email: email || undefined });
      setNom("");
      setPrenom("");
      setTelephone("");
      setEmail("");
      setFormulaireOuvert(false);
      charger();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Impossible de créer l'admin");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  async function handlePromotion(id: string) {
    setEnCours(id);
    setErreur("");
    try {
      await api.promoteToAdmin(id);
      setActionEnAttente(null);
      charger();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Impossible de promouvoir cet utilisateur");
    } finally {
      setEnCours(null);
    }
  }

  async function handleBasculeActivation(u: UtilisateurAdmin) {
    setEnCours(u.id);
    setErreur("");
    try {
      if (u.actif) {
        await api.deactivateUser(u.id);
      } else {
        await api.reactivateUser(u.id);
      }
      setActionEnAttente(null);
      charger();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Action impossible");
    } finally {
      setEnCours(null);
    }
  }

  const listeVide = estAdmin ? utilisateurs.length === 0 : membres.length === 0;

  return (
    <div className="pt-0 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5 gap-3">
          <h1
            className="text-2xl font-bold text-stone-900"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Membres de l&apos;amicale
          </h1>
          {estAdmin && (
            <button
              onClick={() => setFormulaireOuvert((o) => !o)}
              className="text-base font-semibold bg-emerald-900 text-white px-4 py-2 rounded-xl hover:bg-emerald-800 shrink-0"
            >
              {formulaireOuvert ? "Annuler" : "+ Nouvel admin"}
            </button>
          )}
        </div>

        {estAdmin && formulaireOuvert && (
          <form
            onSubmit={handleCreationAdmin}
            className="bg-white rounded-2xl border border-stone-200 p-5 mb-6 space-y-4"
          >
            <p className="text-sm text-stone-600">
              Le nouvel admin recevra un code par SMS pour définir son mot de passe via la
              page &laquo;&nbsp;Définir mon mot de passe&nbsp;&raquo;.
            </p>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Prénom</label>
              <input
                required
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Nom</label>
              <input
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Téléphone</label>
              <input
                required
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Email (optionnel)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              disabled={envoiEnCours}
              className="w-full text-base font-semibold bg-emerald-700 text-white py-3 rounded-xl hover:bg-emerald-800 disabled:opacity-60"
            >
              {envoiEnCours ? "Création..." : "Créer l'administrateur"}
            </button>
          </form>
        )}

        {estAdmin && (
          <div className="flex gap-2 mb-5 overflow-x-auto">
            {[
              { value: "" as const, label: "Tous" },
              { value: "ADHERENT" as const, label: "Adhérents" },
              { value: "ADMIN" as const, label: "Admins" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFiltre(opt.value)}
                className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium border ${
                  filtre === opt.value
                    ? "bg-emerald-900 text-white border-emerald-900"
                    : "bg-white text-stone-600 border-stone-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {erreur && (
          <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-base mb-4">
            {erreur}
          </p>
        )}

        {chargement ? (
          <p className="text-lg text-stone-500">Chargement...</p>
        ) : listeVide ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
            <Users className="w-10 h-10 mx-auto mb-3 text-stone-400" />
            <p className="text-lg text-stone-600">Aucun membre pour ce filtre.</p>
          </div>
        ) : !estAdmin ? (
          // ─── Vue adhérent : simple annuaire, sans action ───────────
          <ul className="space-y-3">
            {membres.map((m) => (
              <li
                key={m.id}
                className="bg-white rounded-2xl border border-stone-200 p-4 flex items-center gap-4"
              >
                <UserAvatar nom={m.nom} prenom={m.prenom} photoUrl={m.photoUrl} size={48} />
                <div>
                  <p className="text-lg font-semibold text-stone-900">
                    {m.prenom} {m.nom}
                  </p>
                  <p className="text-stone-500">{m.telephone}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          // ─── Vue admin : filtres, statut, actions de gestion ───────
          <ul className="space-y-3">
            {utilisateurs.map((u) => {
              const confirmation = actionEnAttente?.id === u.id ? actionEnAttente.type : null;
              return (
                <li key={u.id} className="bg-white rounded-2xl border border-stone-200 p-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar nom={u.nom} prenom={u.prenom} photoUrl={u.photoUrl} size={44} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900 flex items-center gap-1.5">
                        {u.prenom} {u.nom}
                        {u.role === "ADMIN" && (
                          <ShieldCheck
                            className="w-4 h-4 text-emerald-700 shrink-0"
                            aria-label="Administrateur"
                          />
                        )}
                      </p>
                      <p className="text-sm text-stone-500">{u.telephone}</p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${
                        u.actif
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-stone-100 text-stone-500 border-stone-300"
                      }`}
                    >
                      {u.actif ? "Actif" : "Désactivé"}
                    </span>
                  </div>

                  {confirmation ? (
                    <div className="mt-3 pt-3 border-t border-stone-100 space-y-3">
                      <p className="text-stone-700 text-sm">
                        {confirmation === "promouvoir" ? (
                          <>
                            {u.prenom} {u.nom} pourra gérer les événements, les cotisations et
                            les comptes des autres membres. Confirmer ?
                          </>
                        ) : (
                          <>
                            Le compte de {u.prenom} {u.nom} sera désactivé et il ne pourra plus
                            se connecter. Confirmer ?
                          </>
                        )}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            confirmation === "promouvoir"
                              ? handlePromotion(u.id)
                              : handleBasculeActivation(u)
                          }
                          disabled={enCours === u.id}
                          className={`flex-1 text-white py-2 rounded-lg font-medium disabled:opacity-60 ${
                            confirmation === "promouvoir" ? "bg-emerald-900" : "bg-red-700"
                          }`}
                        >
                          {enCours === u.id ? "En cours..." : "Confirmer"}
                        </button>
                        <button
                          onClick={() => setActionEnAttente(null)}
                          className="px-4 py-2 text-stone-500"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap gap-3">
                      {u.role === "ADHERENT" && (
                        <button
                          onClick={() => setActionEnAttente({ id: u.id, type: "promouvoir" })}
                          className="text-sm font-medium text-emerald-900 underline"
                        >
                          Promouvoir admin
                        </button>
                      )}
                      {u.actif ? (
                        <button
                          onClick={() => setActionEnAttente({ id: u.id, type: "desactiver" })}
                          className="text-sm font-medium text-red-700 underline"
                        >
                          Désactiver
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBasculeActivation(u)}
                          disabled={enCours === u.id}
                          className="text-sm font-medium text-emerald-900 underline disabled:opacity-50"
                        >
                          Réactiver
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