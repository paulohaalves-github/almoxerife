import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalHeader from "@/components/ConditionalHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Almoxerife",
  description: "Sistema de Almoxarifado",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConditionalHeader />
        {children}
      </body>
    </html>
  );
}
