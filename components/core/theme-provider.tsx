"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    // @ts-ignore
    <NextThemesProvider attribute="class" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
