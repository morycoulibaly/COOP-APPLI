"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";

export default function ConnexionAdminPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur("");
    setChargement(true);
    try {
      const { access_token, user } = await api.loginAdmin({ telephone, password });
      login(access_token, user);
      router.push("/cotisations");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Identifiants incorrects");
    } finally {
      setChargement(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="italic text-3xl font-bold text-emerald-400">COOP'APPLI</h1>
          <p className="text-zinc-400 mt-2">Espace administrateur</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-emerald-900/30 rounded-2xl p-6 space-y-4"
        >
          <div>
            <label htmlFor="telephone" className="block text-sm text-zinc-300 mb-1">
              Téléphone
            </label>
            <input
              id="telephone"
              type="tel"
              required
              autoFocus
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:border-emerald-600 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-zinc-300 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {erreur && (
            <p className="text-red-400 bg-red-950/50 border border-red-900 rounded-lg px-3 py-2 text-sm">
              {erreur}
            </p>
          )}

          <button
            type="submit"
            disabled={chargement}
            className="w-full bg-emerald-700 text-white font-medium py-2.5 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-60"
          >
            {chargement ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center mt-6">
          <Link href="/login" className="text-sm text-zinc-500 underline">
            Je suis adhérent
          </Link>
        </p>
      </div>
    </main>
  );
}