import NavBar from "@/components/console/navbar";
import { isDatabaseReady } from "@/lib/utils/useDatabase";
import { getOrgs, getOwner } from "@/lib/utils/useOwner";
import { redirect } from "next/navigation";

export const fetchCache = "force-no-store"; // disable cache for console pages
export const dynamic = "force-dynamic"; // disable static generation for console pages

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  const ready = await isDatabaseReady();
  const { orgId } = await getOwner();
  const orgs = await getOrgs();
  const activeOrg = orgs.find((org) => org.id === orgId);

  if (!ready) {
    console.log("Database not ready, redirecting to start");
    redirect("/console/start");
  }

  return (
    <div className="relative flex min-h-full flex-col">
      <NavBar orgs={orgs} activeOrg={activeOrg} />

      <div className="mx-auto w-full flex-grow lg:flex">
        <div className="min-w-0 flex-1 xl:flex">
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:min-w-0 lg:flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
