"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";

type Etape = "infos" | "code";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [etape, setEtape] = useState<Etape>("infos");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [code, setCode] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function handleInscription(e: FormEvent) {
    e.preventDefault();
    setErreur("");
    setChargement(true);
    try {
      await api.requestRegisterOtp({ nom, prenom, telephone });
      setEtape("code");
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

  async function handleValidationCode(e: FormEvent) {
    e.preventDefault();
    setErreur("");
    setChargement(true);
    try {
      const { access_token, user } = await api.verifyRegisterOtp({ telephone, code });
      login(access_token, user);
      router.push("/");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Code incorrect, réessaie.");
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
          <p className="text-lg text-stone-600 mt-2">Créer un compte</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          {etape === "infos" ? (
            <form onSubmit={handleInscription} className="space-y-5">
              <div>
                <label htmlFor="prenom" className="block text-lg font-medium text-stone-800 mb-2">
                  Prénom
                </label>
                <input
                  id="prenom"
                  required
                  autoFocus
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="w-full text-xl px-4 py-4 border-2 border-stone-300 rounded-xl focus:border-emerald-800 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="nom" className="block text-lg font-medium text-stone-800 mb-2">
                  Nom
                </label>
                <input
                  id="nom"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full text-xl px-4 py-4 border-2 border-stone-300 rounded-xl focus:border-emerald-800 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="telephone" className="block text-lg font-medium text-stone-800 mb-2">
                  Ton numéro de téléphone
                </label>
                <input
                  id="telephone"
                  type="tel"
                  inputMode="tel"
                  required
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
                Déjà un compte ?{" "}
                <Link href="/login" className="text-emerald-900 font-medium underline">
                  Se connecter
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleValidationCode} className="space-y-5">
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
                {chargement ? "Vérification..." : "Valider mon code"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setEtape("infos");
                  setCode("");
                  setErreur("");
                }}
                className="w-full text-base text-stone-500 underline py-2"
              >
                Modifier mes informations
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}