import { Home, CalendarDays, Wallet, Users, ClipboardList, LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: ("ADHERENT" | "ADMIN")[]; // absent = visible à tout le monde
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Accueil", href: "/", icon: Home },
  { label: "Événements", href: "/evenements", icon: CalendarDays },
  { label: "Mes Cotisations", href: "/mes-cotisations", icon: Wallet, roles: ["ADHERENT"] },
  { label: "Cotisations", href: "/cotisations", icon: ClipboardList, roles: ["ADMIN"] },
  { label: "Membres", href: "/membres", icon: Users },
];