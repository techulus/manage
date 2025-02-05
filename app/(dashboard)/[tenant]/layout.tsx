import { AppSidebar } from "@/components/app-sidebar";
import { ReportTimezone } from "@/components/core/report-timezone";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CableProvider } from "@/lib/utils/cable-client";
import { getToken } from "@/lib/utils/cable-server";
import { isDatabaseReady } from "@/lib/utils/useDatabase";
import { getOwner, getUser } from "@/lib/utils/useOwner";
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
	const { orgSlug, userId, organizations, orgId } = await getOwner();
	const user = await getUser();

	if (tenant !== orgSlug) {
		redirect("/start");
	}

	if (orgId) {
		const org = organizations.find((org) => org.id === orgId);
		if (!org) {
			redirect("/start");
		}
	}

	const ready = await isDatabaseReady();
	if (!ready) {
		redirect("/start");
	}

	const cableToken = await getToken(userId);

	return (
		<CableProvider token={cableToken}>
			<SidebarProvider>
				<AppSidebar
					user={{
						firstName: user.firstName ?? "",
						email: user.email ?? "",
						imageUrl: null,
					}}
				/>
				<main className="relative mx-auto w-full flex-grow lg:flex">
					<SidebarTrigger className="absolute top-[18px] left-4 z-50" />
					<div className="min-w-0 flex-1 xl:flex">
						<div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:min-w-0 lg:flex-1 pb-8">
							{children}
						</div>
					</div>

					<ReportTimezone />
				</main>
			</SidebarProvider>
		</CableProvider>
	);
}
