"use client";

import { useDetectSticky } from "@/lib/hooks/useDetectSticky";
import { SignedIn, useUser } from "@clerk/nextjs";
import { Transition } from "@headlessui/react";
import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import logo from "../../public/images/logo.png";
import { ThemedOrgSwitcher, ThemedUserButton } from "../core/auth";
import { createToastWrapper } from "../core/toast";

type Props = {
  isPublicPage?: boolean;
  appearance: string;
};

export default function NavBar({ isPublicPage = false, appearance }: Props) {
  const { isLoaded, user } = useUser();
  const path = usePathname();

  const [isSticky, ref] = useDetectSticky();

  const tabs = useMemo(
    () => [
      {
        name: "Today",
        href: "/console/today",
        current: path === "/console/today",
      },
      {
        name: "Projects",
        href: "/console/projects",
        current: path.startsWith("/console/projects"),
      },
      {
        name: "Settings",
        href: "/console/settings",
        current: path === "/console/settings",
      },
    ],
    [path]
  );

  useEffect(() => {
    if (isPublicPage) {
      return;
    }

    if (isLoaded && !user) {
      window.location.href = "/";
    }
  }, [user, isLoaded, isPublicPage]);

  return (
    <>
      {createToastWrapper(appearance)}
      <nav className="flex-shrink-0 text-black dark:text-white">
        <div className="mx-auto px-4 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="flex">
              <Link href="/" className="ml-1">
                <div className="flex items-center lg:px-0">
                  <Image
                    src={logo}
                    alt="Manage"
                    width={32}
                    height={32}
                    className="mr-2 rounded-md"
                  />
                  {isPublicPage ? (
                    <Link href="/" className="-m-1.5 p-1.5">
                      <span className="sr-only">Manage</span>
                      <p className="hero relative">
                        Manage
                        <sup className="absolute top-0 left-[calc(100%+.1rem)] text-xs">
                          [beta]
                        </sup>
                      </p>
                    </Link>
                  ) : null}
                </div>
              </Link>

              <SignedIn>
                <svg
                  fill="none"
                  height="32"
                  shapeRendering="geometricPrecision"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  viewBox="0 0 24 24"
                  width="32"
                  className="text-gray-300 dark:text-gray-700 xl:block mr-2"
                >
                  <path d="M16.88 3.549L7.12 20.451"></path>
                </svg>

                <ThemedOrgSwitcher appearance={appearance} />
              </SignedIn>
            </div>

            <SignedIn>
              <div className="flex ml-2 justify-center">
                <ThemedUserButton appearance={appearance} />
              </div>
            </SignedIn>
          </div>
        </div>
      </nav>

      <div
        className={classNames(
          "flex px-4 lg:px-8 min-w-full bg-background border-b border-gray-200 dark:border-gray-800 -mb-px self-start sticky -top-[1px] z-10",
          isSticky ? "pt-[1px] bg-red shadow-md" : "",
          isPublicPage ? "hidden" : ""
        )}
        ref={ref}
        aria-label="Tabs"
      >
        <Transition
          show={isSticky}
          className="absolute self-center"
          enter="transition-all ease-in-out duration-300"
          enterFrom="transform  translate-y-[-100%] opacity-0"
          enterTo="transform  translate-y-0 opacity-100"
          leave="transition-all ease-in-out duration-300"
          leaveFrom="transform  translate-y-0 opacity-100"
          leaveTo="transform  translate-y-[-100%] opacity-0"
        >
          <Link href="/">
            <Image
              className="rounded-md"
              src={logo}
              alt="Manage"
              width={24}
              height={24}
            />
          </Link>
        </Transition>

        <div
          className={classNames(
            "flex space-x-1 overflow-y-scroll",
            "transition ease-in-out duration-300",
            isSticky ? "translate-x-[40px]" : "translate-x-0"
          )}
        >
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={classNames(
                tab.current
                  ? "border-teal-500 text-teal-600 dark:text-teal-500"
                  : "border-transparent text-gray-500 dark:text-gray-400",
                "whitespace-nowrap border-b-2 py-3 text-sm font-medium"
              )}
              aria-current={tab.current ? "page" : undefined}
            >
              <span className="transition ease-in-out duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white hover:text-black py-2 px-4 rounded-md">
                {tab.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
