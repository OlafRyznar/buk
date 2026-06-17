"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import DemoModeBanner from "@/components/DemoModeBanner";
import BackgroundSlider from "@/components/BackgroundSlider";

const AUTH_PATHS = ["/login", "/register"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((path) => pathname.startsWith(path));

  if (isAuthPage) {
    return (
      <div className="relative min-h-screen">
        <BackgroundSlider />
        <div className="relative">{children}</div>
      </div>
    );
  }

  return (
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
  );
}
