"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import DemoModeBanner from "@/components/DemoModeBanner";
import BackgroundSlider from "@/components/BackgroundSlider";
import { createClient } from "@/lib/supabase/client";

const AUTH_PATHS = ["/login", "/register", "/auth/callback"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = AUTH_PATHS.some((path) => pathname.startsWith(path));
  const [authChecked, setAuthChecked] = useState(false);

  // The middleware enforces "must be logged in" server-side on a Node
  // deployment — but a plain static export has no server to run middleware
  // on at all, so without this check every page would just render logged
  // out. This client-side guard is what actually gates access there, and is
  // a harmless no-op on the Node deployment (middleware already redirected
  // before this ever mounts).
  useEffect(() => {
    if (isAuthPage) {
      setAuthChecked(true);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
        return;
      }
      setAuthChecked(true);
    });
  }, [isAuthPage, pathname, router]);

  if (isAuthPage) {
    return (
      <div className="relative min-h-screen">
        <BackgroundSlider />
        <div className="relative">{children}</div>
      </div>
    );
  }

  if (!authChecked) {
    return (
      <div className="relative min-h-screen">
        <BackgroundSlider />
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
