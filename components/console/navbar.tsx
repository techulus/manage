"use client";

import { useDetectSticky } from "@/lib/hooks/useDetectSticky";
import { cn } from "@/lib/utils";
import { Organization } from "@/ops/types";
import { Transition } from "@headlessui/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";
import logo from "../../public/images/logo.png";
import { OrgSwitcher, UserButton } from "../core/auth";
import { createToastWrapper } from "../core/toast";

export default function NavBar({
  orgs,
  activeOrg,
}: {
  orgs: Organization[];
  activeOrg: Organization | undefined;
}) {
  const { theme } = useTheme();
  const path = usePathname();
  const { projectId } = useParams();

  const [isSticky, ref] = useDetectSticky();

  const tabs = useMemo(
    () =>
      projectId
        ? [
            {
              name: "Overview",
              href: `/console/projects/${projectId}`,
              current: path === `/console/projects/${projectId}`,
            },
            {
              name: "Task Lists",
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
            {
              name: "Activity",
              href: `/console/projects/${projectId}/activity`,
              current: path.startsWith(
                `/console/projects/${projectId}/activity`
              ),
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
    [path, projectId]
  );
  return (
    <>
      {createToastWrapper(theme)}
      <nav className="flex-shrink-0 bg-background text-black dark:bg-gray-950 dark:text-white">
        <div className="mx-auto px-4 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="ml-1 flex items-center justify-center">
              <Link href="/console/projects" prefetch={false}>
                <div className="lg:px-0">
                  <Image
                    src={logo}
                    alt="Manage"
                    width={40}
                    height={40}
                    className="rounded-md"
                  />
                </div>
              </Link>

              <svg
                fill="none"
                height="32"
                shapeRendering="geometricPrecision"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                viewBox="0 0 24 24"
                width="40"
                className="ml-2 text-gray-300 dark:text-gray-700 xl:block"
              >
                <path d="M16.88 3.549L7.12 20.451"></path>
              </svg>

              <OrgSwitcher orgs={orgs} activeOrg={activeOrg} />
            </div>

            <div className="ml-2 flex justify-center">
              <UserButton />
            </div>
          </div>
        </div>
      </nav>

      <div
        className={cn(
          "sticky -top-[1px] z-10 -mb-px flex w-screen self-start border-b border-gray-200 bg-background px-4 dark:border-gray-800 dark:bg-gray-950 lg:px-8",
          isSticky ? "pt-[1px] shadow-md" : ""
        )}
        ref={ref}
        aria-label="Tabs"
      >
        <Transition
          show={isSticky}
          className="absolute hidden self-center md:block"
          enter="transition-all ease-in-out duration-300"
          enterFrom="transform  translate-y-[-100%] opacity-0"
          enterTo="transform  translate-y-0 opacity-100"
          leave="transition-all ease-in-out duration-300"
          leaveFrom="transform  translate-y-0 opacity-100"
          leaveTo="transform  translate-y-[-100%] opacity-0"
        >
          <Link href="/" prefetch={false}>
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
            "hidden-scrollbar flex space-x-1 overflow-y-scroll transition duration-300 ease-in-out",
            isSticky ? "md:translate-x-[40px]" : "md:translate-x-0"
          )}
        >
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                tab.current
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 dark:text-gray-400",
                "whitespace-nowrap border-b-2 py-3 text-sm font-medium"
              )}
              aria-current={tab.current ? "page" : undefined}
              prefetch={false}
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
