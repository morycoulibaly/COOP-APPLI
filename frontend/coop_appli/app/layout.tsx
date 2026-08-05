import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import { AuthProvider } from "../lib/auth-context";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "COOP'APPLI",
  description: "Gestion des cotisations de l'amicale",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={playfair.variable}>
      <body className="text-lg antialiased bg-stone-50">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}