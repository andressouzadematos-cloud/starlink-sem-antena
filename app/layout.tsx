import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Starlink Sem Antena | Internet por Satélite com e-SIM",
  description:
    "Internet por satélite sem antena. e-SIM digital que ativa em minutos e funciona em todo o Brasil. A partir de R$ 24,90/mês, sem fidelidade.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
