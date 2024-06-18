"use client";

import { useDetectSticky } from "@/lib/hooks/useDetectSticky";
import { useTheme } from "@/lib/hooks/useTheme";
import { cn } from "@/lib/utils";
import { SignedIn } from "@clerk/nextjs";
import { Transition } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";
import logo from "../../public/images/logo.png";
import { ThemedOrgSwitcher, ThemedUserButton } from "../core/auth";
import { createToastWrapper } from "../core/toast";

export default function NavBar() {
  const appearance = useTheme();
  const path = usePathname();
  const { projectId } = useParams();

  const [isSticky, ref] = useDetectSticky();

  const tabs = useMemo(
    () =>
      projectId
        ? [
            {
              name: "Project",
              href: `/console/projects/${projectId}`,
              current: path === `/console/projects/${projectId}`,
            },
            {
              name: "Task lists",
              href: `/console/projects/${projectId}/tasklists`,
              current: path.startsWith(
                `/console/projects/${projectId}/tasklists`
              ),
            },
            {
              name: "Docs & Files",
              href: `/console/projects/${projectId}/documents`,
              current: path.startsWith(
                `/console/projects/${projectId}/documents`
              ),
            },
            {
              name: "Events",
              href: `/console/projects/${projectId}/events`,
              current: path.startsWith(`/console/projects/${projectId}/events`),
            },
          ]
        : [
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
  return (
    <>
      {createToastWrapper(appearance)}
      <nav className="flex-shrink-0 text-black dark:text-white">
        <div className="mx-auto px-4 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="flex">
              <Link href="/console/projects" className="ml-1">
                <div className="flex items-center lg:px-0">
                  <Image
                    src={logo}
                    alt="Manage"
                    width={32}
                    height={32}
                    className="mr-2 rounded-md"
                  />
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
                  className="mr-2 text-gray-300 dark:text-gray-700 xl:block"
                >
                  <path d="M16.88 3.549L7.12 20.451"></path>
                </svg>

                <ThemedOrgSwitcher appearance={appearance} />
              </SignedIn>
            </div>

            <div className="ml-2 flex justify-center">
              <SignedIn>
                <ThemedUserButton appearance={appearance} />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={cn(
          "sticky -top-[1px] z-10 -mb-px flex min-w-full self-start border-b border-gray-200 bg-background px-4 dark:border-gray-800 lg:px-8",
          isSticky ? "pt-[1px] shadow-md" : ""
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
          className={cn(
            "flex space-x-1 overflow-y-scroll",
            "transition duration-300 ease-in-out",
            isSticky ? "translate-x-[40px]" : "translate-x-0"
          )}
        >
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                tab.current
                  ? "border-teal-500 text-teal-600 dark:text-teal-500"
                  : "border-transparent text-gray-500 dark:text-gray-400",
                "whitespace-nowrap border-b-2 py-3 text-sm font-medium"
              )}
              aria-current={tab.current ? "page" : undefined}
            >
              <span className="rounded-md px-4 py-2 transition duration-300 ease-in-out hover:bg-gray-100 hover:text-black dark:hover:bg-gray-800 dark:hover:text-white">
                {tab.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
