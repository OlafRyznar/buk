import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { AppProvider } from "@/components/AppProvider";
import DemoModeBanner from "@/components/DemoModeBanner";
import BackgroundSlider from "@/components/BackgroundSlider";

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
          <div className="relative min-h-screen">
            <BackgroundSlider />
            <div className="relative flex min-h-screen">
              <Sidebar />
              <main className="flex-1 lg:ml-[280px]">
                <DemoModeBanner />
                <div className="w-full px-3 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-[5.2rem] sm:px-6 lg:px-12 lg:pt-7">
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
