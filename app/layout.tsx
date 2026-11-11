import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const SITE_URL = "https://starlink-sem-antena.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Starlink E-Sim | Internet por Satélite sem Antena",
    template: "%s | Starlink E-Sim",
  },

  description:
    "Internet por satélite sem antena. e-SIM digital que ativa em minutos e funciona em todo o Brasil. A partir de R$ 24,90/mês, sem fidelidade e sem instalação.",

  keywords: [
    "starlink sem antena",
    "starlink e-sim",
    "internet por satélite",
    "internet rural",
    "e-sim brasil",
    "internet sem antena",
    "internet para zona rural",
    "chip virtual internet",
    "internet ilimitada",
    "plano de internet móvel",
  ],

  authors: [{ name: "Starlink E-Sim" }],
  creator: "Starlink E-Sim",
  publisher: "Starlink E-Sim",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "Starlink E-Sim",
    title: "Starlink E-Sim | Internet por Satélite sem Antena",
    description:
      "Internet por satélite sem antena. e-SIM digital que ativa em minutos e funciona em todo o Brasil. A partir de R$ 24,90/mês, sem fidelidade.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Starlink E-Sim — Internet por satélite sem antena",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Starlink E-Sim | Internet por Satélite sem Antena",
    description:
      "Internet por satélite sem antena. e-SIM digital que ativa em minutos e funciona em todo o Brasil.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },

  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#08090B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className={`${inter.className} bg-[#08090B] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
