"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/auth-context";

type Etape = "telephone" | "motDePasse";

export default function DefinirMotDePassePage() {
  const router = useRouter();
  const { login } = useAuth();

  const [etape, setEtape] = useState<Etape>("telephone");
  const [telephone, setTelephone] = useState("");
  const [code, setCode] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function handleDemandeCode(e: FormEvent) {
    e.preventDefault();
    setErreur("");
    setChargement(true);
    try {
      // Réponse toujours neutre côté backend, même si le numéro n'est pas
      // celui d'un admin — normal d'arriver ici sans erreur dans tous les cas.
      await api.requestAdminPasswordOtp({ telephone });
      setEtape("motDePasse");
    } catch (err) {
      setErreur(
        err instanceof Error
          ? err.message
          : "Impossible d'envoyer le code, vérifie ta connexion.",
      );
    } finally {
      setChargement(false);
    }
  }

  async function handleDefinition(e: FormEvent) {
    e.preventDefault();
    setErreur("");

    if (nouveauMotDePasse !== confirmation) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (nouveauMotDePasse.length < 8) {
      setErreur("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setChargement(true);
    try {
      const { access_token, user } = await api.setAdminPassword({
        telephone,
        code,
        newPassword: nouveauMotDePasse,
      });
      login(access_token, user);
      router.push("/");
    } catch (err) {
      setErreur(
        err instanceof Error ? err.message : "Code incorrect ou expiré, réessaie.",
      );
    } finally {
      setChargement(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold text-stone-900"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            COOP&apos;APPLI
          </h1>
          <p className="text-lg text-stone-600 mt-2">Définir mon mot de passe admin</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          {etape === "telephone" ? (
            <form onSubmit={handleDemandeCode} className="space-y-5">
              <p className="text-base text-stone-600">
                Réservé aux comptes administrateurs. Entre ton numéro pour recevoir un
                code de vérification par SMS.
              </p>
              <div>
                <label htmlFor="telephone" className="block text-lg font-medium text-stone-800 mb-2">
                  Ton numéro de téléphone
                </label>
                <input
                  id="telephone"
                  type="tel"
                  inputMode="tel"
                  required
                  autoFocus
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="07 08 09 00 01"
                  className="w-full text-xl px-4 py-4 border-2 border-stone-300 rounded-xl focus:border-emerald-800 focus:outline-none"
                />
              </div>
              {erreur && (
                <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-base">
                  {erreur}
                </p>
              )}
              <button
                type="submit"
                disabled={chargement}
                className="w-full text-xl font-semibold bg-emerald-900 text-white py-4 rounded-xl hover:bg-emerald-800 active:bg-emerald-950 transition-colors disabled:opacity-60"
              >
                {chargement ? "Envoi en cours..." : "Recevoir mon code"}
              </button>
              <p className="text-center text-base text-stone-500">
                <Link href="/login" className="text-emerald-900 font-medium underline">
                  Retour à la connexion
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleDefinition} className="space-y-5">
              <div>
                <label htmlFor="code" className="block text-lg font-medium text-stone-800 mb-2">
                  Le code reçu par SMS
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full text-2xl tracking-widest text-center px-4 py-4 border-2 border-stone-300 rounded-xl focus:border-emerald-800 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="motdepasse" className="block text-lg font-medium text-stone-800 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  id="motdepasse"
                  type="password"
                  required
                  minLength={8}
                  value={nouveauMotDePasse}
                  onChange={(e) => setNouveauMotDePasse(e.target.value)}
                  className="w-full text-xl px-4 py-4 border-2 border-stone-300 rounded-xl focus:border-emerald-800 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="confirmation" className="block text-lg font-medium text-stone-800 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmation"
                  type="password"
                  required
                  minLength={8}
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  className="w-full text-xl px-4 py-4 border-2 border-stone-300 rounded-xl focus:border-emerald-800 focus:outline-none"
                />
              </div>

              {erreur && (
                <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-base">
                  {erreur}
                </p>
              )}

              <button
                type="submit"
                disabled={chargement}
                className="w-full text-xl font-semibold bg-emerald-900 text-white py-4 rounded-xl hover:bg-emerald-800 active:bg-emerald-950 transition-colors disabled:opacity-60"
              >
                {chargement ? "Enregistrement..." : "Définir mon mot de passe"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setEtape("telephone");
                  setCode("");
                  setErreur("");
                }}
                className="w-full text-base text-stone-500 underline py-2"
              >
                Modifier mon numéro
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}