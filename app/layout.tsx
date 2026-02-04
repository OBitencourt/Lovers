import type { Metadata } from "next";
import { DM_Sans, Harmattan } from "next/font/google"; // Importando as novas fontes
import "./globals.css";
import Footer from "@/components/footer";

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
        <Footer />
      </body>
    </html>
  );
}