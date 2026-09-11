import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI BROKER | asesor.inmobia360.com",
  description: "Plataforma SaaS marca blanca para agencias y profesionales inmobiliarios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
