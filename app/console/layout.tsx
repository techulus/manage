import NavBar from "@/components/console/navbar";
import { isDatabaseReady, migrateDatabase } from "@/lib/utils/useDatabase";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ready = await isDatabaseReady();

  if (!ready) {
    console.log("Database not ready, redirecting to start");
    redirect("/console/start");
  } else {
    await migrateDatabase();
  }

  return (
    <div className="relative flex min-h-full flex-col">
      <NavBar />

      <div className="mx-auto w-full flex-grow lg:flex">
        <div className="min-w-0 flex-1 xl:flex">
          <div className="min-h-screen bg-gray-50 pb-12 dark:bg-card lg:min-w-0 lg:flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
