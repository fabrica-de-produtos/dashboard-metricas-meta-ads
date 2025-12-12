import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Painel de Resultados",
  description: "Dashboard de métricas de campanhas de anúncios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={`${inter.variable} antialiased bg-dark-primary text-text-primary min-h-screen`}>
        {children}
        <Script
          src="https://cdn.plot.ly/plotly-2.27.0.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
