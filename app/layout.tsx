import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lar Esperança — Campanha de Natal 2026",
  description:
    "Ajude a garantir comida na mesa e um brinquedo novo para cada criança do Lar Esperança.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}