import type { Metadata } from "next";
import { DM_Sans, Harmattan } from "next/font/google"; // Importando as novas fontes
import "./globals.css";
import Footer from "@/components/footer";
import { GoogleAnalytics } from '@next/third-parties/google'

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const harmattan = Harmattan({
  variable: "--font-harmattan",
  subsets: ["latin"],
  weight: ["400", "700"], // Harmattan geralmente precisa de pesos definidos
});

export const metadata: Metadata = {
  title: "Lovers - Surpreenda seu parceiro",
  openGraph: {
    title: "Lovers",
    siteName: "Lovers",
    url: "https://www.lovers.pt",
    type: "website",
  },
  description:
    "Transforme sua história de amor em uma homenagem digital inesquecível. Crie uma página com fotos, mensagens e memórias para surpreender quem você ama.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      {/* Adicionando as variáveis no body */}
      <body
        className={`${dmSans.variable} ${harmattan.variable} overflow-x-hidden antialiased`}
      >
        {children}
        <GoogleAnalytics gaId="G-FPKRBTS8F4" />
        <Footer />
      </body>
    </html>
  );
}