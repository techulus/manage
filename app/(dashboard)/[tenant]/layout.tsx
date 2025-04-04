import { AppSidebar } from "@/components/app-sidebar";
import { SpinnerWithSpacing } from "@/components/core/loaders";
import { ReportTimezone } from "@/components/core/report-timezone";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { isDatabaseReady } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getNotificationsWire, getSidebarWire } from "./settings/actions";

export const fetchCache = "force-no-store"; // disable cache for console pages
export const dynamic = "force-dynamic"; // disable static generation for console pages

export default async function ConsoleLayout(props: {
	children: React.ReactNode;
	params: Promise<{
		tenant: string;
	}>;
}) {
	const ready = await isDatabaseReady();
	if (!ready) {
		redirect("/start");
	}

	const { tenant } = await props.params;
	const { children } = props;
	const { orgSlug } = await getOwner();

	if (tenant !== orgSlug) {
		redirect("/start");
	}

	const [notificationsWire, sidebarWire] = await Promise.all([
		getNotificationsWire(),
		getSidebarWire(),
	]);

	return (
		<SidebarProvider>
			<AppSidebar
				notificationsWire={notificationsWire}
				sidebarWire={sidebarWire}
			/>
			<main className="relative mx-auto w-full flex-grow lg:flex">
				<SidebarTrigger className="absolute top-[18px] left-4 z-50" />
				<div className="min-w-0 flex-1 xl:flex">
					<div className="min-h-screen bg-background lg:min-w-0 lg:flex-1 pb-8">
						<Suspense fallback={<SpinnerWithSpacing />}>{children}</Suspense>
					</div>
				</div>

				<ReportTimezone />
			</main>
		</SidebarProvider>
	);
}
