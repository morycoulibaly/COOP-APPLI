import type { Metadata } from "next";
import { AuthProvider } from "../lib/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "COOP'APPLI",
  description: "Gestion des cotisations de l'amicale",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      {/* text-lg en base : lisibilité par défaut pour un public senior */}
      <body className="text-lg antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}