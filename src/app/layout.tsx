import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import AppShell from "@/components/AppShell";

const sansFont = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
});

const displayFont = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "BukScan - Arbitrage Finder",
  description:
    "Porównywarka kursów bukmacherskich i wyszukiwarka okazji arbitrażowych. Znajdź pewny zysk porównując kursy z wielu bukmacherów.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body
        className={`${sansFont.variable} ${displayFont.variable} ${monoFont.variable} antialiased`}
      >
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
