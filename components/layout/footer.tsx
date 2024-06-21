"use client";

import { useTheme } from "@/lib/hooks/useTheme";
import Link from "next/link";

const navigation = {
  main: [
    { name: "Terms", href: "/terms" },
    { name: "Source code", href: "https://github.com/techulus/manage" },
  ],
};

export function Footer() {
  useTheme();

  return (
    <footer className="mt-28 border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        <nav
          className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12"
          aria-label="Footer"
        >
          {navigation.main.map((item) => (
            <div key={item.name} className="pb-6">
              <Link
                href={item.href}
                className="text-sm font-semibold leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {item.name}
              </Link>
            </div>
          ))}
        </nav>

        <p className="mt-4 text-sm leading-5 text-gray-500 sm:text-center">
          &copy; 2023 Techulus. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
