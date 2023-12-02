"use client";

import NavBar from "@/components/console/navbar";
import { useTheme } from "@/lib/hooks/useTheme";

export const dynamic = "force-dynamic";

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <div className="relative flex min-h-full flex-col">
      <NavBar appearance={theme} />

      <div className="mx-auto w-full flex-grow lg:flex">
        <div className="min-w-0 flex-1 xl:flex">
          <div className="pb-12 lg:min-w-0 lg:flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
