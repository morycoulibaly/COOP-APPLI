"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";

type Etape = "telephone" | "code";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [etape, setEtape] = useState<Etape>("telephone");
  const [telephone, setTelephone] = useState("");
  const [code, setCode] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function handleDemandeCode(e: FormEvent) {
    e.preventDefault();
    setErreur("");
    setChargement(true);
    try {
      await api.requestLoginOtp({ telephone });
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
      const { access_token, user } = await api.verifyLoginOtp({
        telephone,
        code,
      });
      login(access_token, user);
      router.push("/");
    } catch (err) {
      setErreur(
        err instanceof Error ? err.message : "Code incorrect, réessaie.",
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
            COOP'APPLI
          </h1>
          <p className="text-lg text-stone-500 mt-2">Connexion</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          {etape === "telephone" ? (
            <form onSubmit={handleDemandeCode} className="space-y-5">
              <div>
                <label
                  htmlFor="telephone"
                  className="block text-lg font-medium text-stone-800 mb-2"
                >
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
                  className="w-full text-xl px-4 py-4 border-2 border-stone-300 rounded-xl focus:border-emerald-700 focus:outline-none"
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
            </form>
          ) : (
            <form onSubmit={handleValidationCode} className="space-y-5">
              <div>
                <label
                  htmlFor="code"
                  className="block text-lg font-medium text-stone-800 mb-2"
                >
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
                  className="w-full text-2xl tracking-widest text-center px-4 py-4 border-2 border-stone-300 rounded-xl focus:border-emerald-700 focus:outline-none"
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

        <p className="text-center mt-6">
          <Link
            href="/connexion-admin"
            className="text-sm text-stone-400 underline"
          >
            Je suis administrateur
          </Link>
          <p className="text-sm text-stone-400 underline mt-2">
            <Link href="/register">Créer un compte</Link> ·{" "}
            </p>
            <p className="text-sm text-stone-400 underline mt-2">
            <Link href="/admin/mot-de-passe">
              Je suis admin, définir mon mot de passe
            </Link>
          </p>
        </p>
      </div>
    </main>
  );
}
