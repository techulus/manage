import NavBar from "@/components/console/navbar";
import { isDatabaseReady } from "@/lib/utils/useDatabase";
import { redirect } from "next/navigation";

export const fetchCache = "force-no-store";

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ready = await isDatabaseReady();

  if (!ready) {
    console.log("Database not ready, redirecting to start");
    redirect("/console/start");
  }

  return (
    <div className="relative flex min-h-full flex-col">
      <NavBar />

      <div className="mx-auto w-full flex-grow lg:flex">
        <div className="min-w-0 flex-1 xl:flex">
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900  lg:min-w-0 lg:flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
