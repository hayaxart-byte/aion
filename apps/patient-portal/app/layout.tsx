import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@aion/ui";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aion — Portal del Paciente",
  description: "Accede a tu historial médico y gestiona tu salud",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider><ToastProvider>{children}</ToastProvider></AuthProvider>
      </body>
    </html>
  );
}
