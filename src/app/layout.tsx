import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inmobia 360 | Tu Agencia Inmobiliaria en el Bolsillo para Agentes y Pequeñas Agencias",
  description: "Plataforma SaaS marca blanca para agencias y profesionales inmobiliarios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
