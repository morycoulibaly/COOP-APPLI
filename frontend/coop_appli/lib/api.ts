const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const TOKEN_KEY = "coopappli_token";

export interface User {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  role: "ADHERENT" | "ADMIN";
}

export interface Evenement {
  id: string;
  nom: string;
  description: string | null;
  montantCotisation: string;
  dateEvenement: string;
  dateLimitePaiement: string;
  statut: "OUVERT" | "CLOS";
}

export interface Cotisation {
  id: string;
  montantDu: string;
  statut: "EN_ATTENTE" | "PAYEE" | "EN_RETARD";
  dateEcheance: string;
  evenement: { id: string; nom: string; dateEvenement: string };
  user?: { id: string; nom: string; prenom: string; telephone: string };
}

export interface Membre {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
}

interface AuthResponse {
  access_token: string;
  user: User;
}

class ApiRequestError extends Error {}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res
      .json()
      .catch(() => ({ message: "Une erreur est survenue, réessaie." }));
    const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    throw new ApiRequestError(message || "Une erreur est survenue, réessaie.");
  }

  if (res.status === 204) return undefined as T;

  // Certaines routes (ex. request-otp) renvoient 200 avec un corps vide,
  // pas 204 — on ne peut donc pas se fier uniquement au status code.
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text);
}

export const api = {
  requestRegisterOtp: (data: { nom: string; prenom: string; telephone: string }) =>
    request<void>("/auth/register/request-otp", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyRegisterOtp: (data: { telephone: string; code: string }) =>
    request<AuthResponse>("/auth/register/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  requestLoginOtp: (data: { telephone: string }) =>
    request<void>("/auth/login/request-otp", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyLoginOtp: (data: { telephone: string; code: string }) =>
    request<AuthResponse>("/auth/login/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMyCotisations: () => request<Cotisation[]>("/cotisations/mine"),

  // ─── Événements ────────────────────────────────────────────

  getEvenements: () => request<Evenement[]>("/evenements"),

  createEvenement: (data: {
    nom: string;
    description?: string;
    montantCotisation: number;
    dateEvenement: string;
    dateLimitePaiement: string;
  }) =>
    request<Evenement>("/evenements", { method: "POST", body: JSON.stringify(data) }),

  closeEvenement: (id: string) =>
    request<Evenement>(`/evenements/${id}/close`, { method: "PATCH" }),

  // ─── Membres ───────────────────────────────────────────────

  getMembers: () => request<Membre[]>("/users/members"),

  // ─── Cotisations (vue admin) ──────────────────────────────

  getCotisationsAdmin: (filters?: { evenementId?: string; statut?: string; userId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.evenementId) params.set("evenementId", filters.evenementId);
    if (filters?.statut) params.set("statut", filters.statut);
    if (filters?.userId) params.set("userId", filters.userId);
    const query = params.toString();
    return request<Cotisation[]>(`/cotisations${query ? `?${query}` : ""}`);
  },

  registerPaiement: (
    cotisationId: string,
    data: { montant: number; moyenPaiement: string; note?: string },
  ) =>
    request(`/cotisations/${cotisationId}/paiements`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const tokenStorage = {
  save: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  get: () => (typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};