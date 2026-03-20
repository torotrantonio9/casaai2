import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CasaAI — Trova casa con l'intelligenza artificiale",
  description: "Marketplace immobiliare AI-first per il mercato italiano. Cerca casa in Campania con il nostro assistente intelligente.",
  keywords: ["immobiliare", "casa", "AI", "Napoli", "Campania", "appartamento", "affitto", "vendita"],
  openGraph: {
    title: "CasaAI — Trova casa con l'intelligenza artificiale",
    description: "Marketplace immobiliare AI-first per il mercato italiano.",
    type: "website",
    locale: "it_IT",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-geist-sans)]">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
