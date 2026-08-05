"use client";

import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/auth-context";
import { UserAvatar } from "../../../components/user-avatar";

export default function ProfilePage() {
  const { user, login, logout } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [modifierTelephone, setModifierTelephone] = useState(false);
  const [telephone, setTelephone] = useState(user?.telephone ?? "");
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [chargement, setChargement] = useState(false);
  const [envoiPhoto, setEnvoiPhoto] = useState(false);

  if (!user) return null;

  function rafraichirUser(patch: Partial<typeof user>) {
    const token = localStorage.getItem("coopappli_token")!;
    login(token, { ...user!, ...patch });
  }

  async function handleEnregistrerTelephone(e: FormEvent) {
    e.preventDefault();
    setErreur("");
    setSucces("");
    setChargement(true);
    try {
      const updated = await api.updateMyProfile({ telephone });
      rafraichirUser({ telephone: updated.telephone });
      setSucces("Numéro mis à jour avec succès.");
      setModifierTelephone(false);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Impossible de mettre à jour le numéro");
    } finally {
      setChargement(false);
    }
  }

  async function handleChangerPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErreur("");
    setEnvoiPhoto(true);
    try {
      const updated = await api.uploadPhoto(file);
      rafraichirUser({ photoUrl: updated.photoUrl });
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Impossible d'envoyer la photo");
    } finally {
      setEnvoiPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="max-w-md mx-auto">
        <h1
          className="text-2xl font-bold text-stone-900 mb-1"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Mon profil
        </h1>
        <p className="text-stone-500 mb-6">Gère tes informations personnelles.</p>

        <div className="bg-white rounded-2xl border border-emerald-200 p-6 text-center mb-4">
          <div className="flex justify-center mb-4">
            <UserAvatar nom={user.nom} prenom={user.prenom} photoUrl={user.photoUrl} size={96} />
          </div>
          <p className="text-xl font-semibold text-stone-900">
            {user.prenom} {user.nom}
          </p>
          <span className="inline-block text-sm bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full mt-2">
            {user.role === "ADMIN" ? "Administrateur" : "Adhérent"}
          </span>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleChangerPhoto}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={envoiPhoto}
            className="mt-4 w-full border border-stone-300 text-stone-700 py-2.5 rounded-xl font-medium hover:bg-stone-50 disabled:opacity-60"
          >
            {envoiPhoto ? "Envoi en cours..." : "Modifier la photo"}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-4">
          {!modifierTelephone ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Numéro de téléphone</p>
                <p className="text-lg font-medium text-stone-900">{user.telephone}</p>
              </div>
              <button
                onClick={() => {
                  setModifierTelephone(true);
                  setTelephone(user.telephone);
                }}
                className="text-sm font-medium text-emerald-800 underline"
              >
                Éditer
              </button>
            </div>
          ) : (
            <form onSubmit={handleEnregistrerTelephone} className="space-y-3">
              <label className="block text-sm text-stone-500">Nouveau numéro</label>
              <input
                type="tel"
                required
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-lg"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={chargement}
                  className="flex-1 bg-emerald-900 text-white py-2.5 rounded-lg font-medium disabled:opacity-60"
                >
                  {chargement ? "Enregistrement..." : "Enregistrer"}
                </button>
                <button
                  type="button"
                  onClick={() => setModifierTelephone(false)}
                  className="px-4 py-2.5 text-stone-500"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}

          {erreur && (
            <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm mt-3">
              {erreur}
            </p>
          )}
          {succes && (
            <p className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm mt-3">
              {succes}
            </p>
          )}
        </div>

        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="w-full text-center text-red-700 bg-red-50 border border-red-200 py-3 rounded-xl font-medium"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}