import NavBar from "@/components/console/navbar";
import { ReportTimezone } from "@/components/core/report-timezone";
import { project } from "@/drizzle/schema";
import { database, isDatabaseReady } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { ne } from "drizzle-orm";
import { redirect } from "next/navigation";

export const fetchCache = "force-no-store"; // disable cache for console pages
export const dynamic = "force-dynamic"; // disable static generation for console pages

export default async function ConsoleLayout(props: {
	children: React.ReactNode;
	params: Promise<{
		tenant: string;
	}>;
}) {
	const { tenant } = await props.params;

	const { children } = props;
	const { orgId, orgSlug, userId } = await getOwner();

	if (tenant !== orgSlug) {
		redirect("/start");
	}

	const ready = await isDatabaseReady();
	if (!ready) {
		redirect("/start");
	}

	const db = await database();
	const projects = await db.query.project.findMany({
		where: ne(project.status, "archived"),
	});

	return (
		<div className="relative flex min-h-full flex-col">
			<NavBar
				activeOrgId={orgId ?? userId}
				activeOrgSlug={orgSlug}
				projects={projects}
			/>

			<div className="mx-auto w-full flex-grow lg:flex">
				<div className="min-w-0 flex-1 xl:flex">
					<div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:min-w-0 lg:flex-1">
						{children}
					</div>
				</div>
			</div>

			<ReportTimezone />
		</div>
	);
}
