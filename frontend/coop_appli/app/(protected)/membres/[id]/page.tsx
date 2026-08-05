"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, Membre } from "../../../../lib/api";
import { useAuth } from "../../../../lib/auth-context";
import { UserAvatar } from "../../../../components/user-avatar";

export default function MembreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [membre, setMembre] = useState<Membre | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [promotionEnCours, setPromotionEnCours] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);

  useEffect(() => {
    api
      .getMemberDetail(id)
      .then(setMembre)
      .catch((err) => setErreur(err instanceof Error ? err.message : "Membre introuvable"))
      .finally(() => setChargement(false));
  }, [id]);

  async function handlePromotion() {
    setPromotionEnCours(true);
    setErreur("");
    try {
      await api.promoteToAdmin(id);
      const updated = await api.getMemberDetail(id);
      setMembre(updated);
      setConfirmationVisible(false);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Impossible de promouvoir ce membre");
    } finally {
      setPromotionEnCours(false);
    }
  }

  if (chargement) {
    return (
      <div className="pt-0 px-4 py-6">
        <p className="text-lg text-stone-500 max-w-md mx-auto">Chargement...</p>
      </div>
    );
  }

  if (erreur && !membre) {
    return (
      <div className="pt-0 px-4 py-6">
        <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 max-w-md mx-auto">
          {erreur}
        </p>
      </div>
    );
  }

  if (!membre) return null;

  const peutPromouvoir = currentUser?.role === "ADMIN" && membre.role === "ADHERENT";

  return (
    <div className="pt-0 px-4 py-6">
      <div className="max-w-md mx-auto">
        <button onClick={() => router.back()} className="text-stone-500 mb-4 text-sm underline">
          ← Retour à l'annuaire
        </button>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center">
          <div className="flex justify-center mb-4">
            <UserAvatar nom={membre.nom} prenom={membre.prenom} photoUrl={membre.photoUrl} size={80} />
          </div>
          <p className="text-xl font-semibold text-stone-900">
            {membre.prenom} {membre.nom}
          </p>
          <p className="text-stone-500 mt-1">{membre.telephone}</p>
          {currentUser?.role === "ADMIN" && membre.role && (
            <p className="text-sm text-stone-400 mt-2 uppercase tracking-wide">
              {membre.role === "ADMIN" ? "Administrateur" : "Adhérent"}
            </p>
          )}
        </div>

        {erreur && (
          <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm mt-4">
            {erreur}
          </p>
        )}

        {peutPromouvoir && (
          <div className="mt-4 bg-white rounded-2xl border border-stone-200 p-5">
            {!confirmationVisible ? (
              <button
                onClick={() => setConfirmationVisible(true)}
                className="w-full text-base font-semibold bg-emerald-900 text-white py-3 rounded-xl hover:bg-emerald-800"
              >
                Promouvoir en administrateur
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-stone-700">
                  {membre.prenom} {membre.nom} pourra gérer les événements, les cotisations et les
                  comptes des autres membres. Confirmer ?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handlePromotion}
                    disabled={promotionEnCours}
                    className="flex-1 bg-emerald-900 text-white py-2.5 rounded-lg font-medium disabled:opacity-60"
                  >
                    {promotionEnCours ? "Promotion..." : "Confirmer"}
                  </button>
                  <button
                    onClick={() => setConfirmationVisible(false)}
                    className="px-4 py-2.5 text-stone-500"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}