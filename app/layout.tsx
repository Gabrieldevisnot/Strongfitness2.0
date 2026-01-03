import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { MainLayout } from "@/components/layout/MainLayout"; // <--- Importamos aqui

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-montserrat" });

export const metadata: Metadata = {
  title: "STRONGFITNESS",
  description: "Roupas Fitness Premium",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${montserrat.variable} bg-background text-text antialiased`}>
        {/* Envolvemos tudo no nosso Layout inteligente */}
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}