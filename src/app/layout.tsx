import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { AppProvider } from "@/components/AppProvider";
import DemoModeBanner from "@/components/DemoModeBanner";

const sansFont = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
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
        className={`${sansFont.variable} ${monoFont.variable} antialiased`}
      >
        <AppProvider>
          <div className="relative min-h-screen bg-[linear-gradient(180deg,#0f1318_0%,#0d1116_100%)]">
            <div className="relative flex min-h-screen">
              <Sidebar />
              <main className="flex-1 lg:ml-[304px]">
                <DemoModeBanner />
                <div className="mx-auto w-full max-w-[1320px] px-3 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-[5.2rem] sm:px-6 lg:px-8 lg:pt-7">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
