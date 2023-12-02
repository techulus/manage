"use client";

import { useEffect } from "react";
import usePrefersColorScheme from "./usePrefersColorScheme";

export const useTheme = () => {
  const colorScheme = usePrefersColorScheme();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(colorScheme);
  }, [colorScheme]);

  return colorScheme == "no-preference" ? "light" : colorScheme;
};
