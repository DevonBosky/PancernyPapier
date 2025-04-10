import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pancerny Papier - Generowanie Dokumentów Prawnych",
  description: "Szybkie i łatwe generowanie dokumentów prawnych z pomocą sztucznej inteligencji",
  keywords: "dokumenty prawne, generowanie dokumentów, AI, sztuczna inteligencja, pomoc prawna, wypowiedzenie umowy, reklamacja, wezwanie do zapłaty",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#4F46E5" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
