import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

// Carte avec onglet coloré — le repère visuel signature de l'appli.
// vert = ok/payé, ocre = en attente, rouge = en retard/attention.
const COULEURS_ACCENT = {
  vert: "#1F6B4C",
  ocre: "#B8863B",
  rouge: "#B54A3F",
} as const;

export function Carte({
  children,
  accent = "vert",
}: {
  children: ReactNode;
  accent?: keyof typeof COULEURS_ACCENT;
}) {
  const couleur = COULEURS_ACCENT[accent];
  return (
    <div
      className="bg-white border border-[#E4DFD3] rounded-r-xl mb-3 p-4"
      style={{ borderLeft: `5px solid ${couleur}` }}
    >
      {children}
    </div>
  );
}

// État vide — jamais une page blanche silencieuse. Un titre qui nomme
// l'espace, une phrase qui explique, et une action si possible.
export function EtatVide({
  icon: Icon,
  titre,
  description,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  titre: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="text-center py-12 px-4">
      <Icon className="w-12 h-12 mx-auto mb-4 text-[#8B8F85]" stroke={1.5} />
      <h3 className="font-serif text-lg font-bold text-[#23291F] mb-2">
        {titre}
      </h3>
      <p className="text-[15px] text-[#5B6157] mb-5">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-[#1F6B4C] text-white rounded-xl px-6 py-3 text-[15px] font-semibold"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}