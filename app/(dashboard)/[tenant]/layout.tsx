import { SpinnerWithSpacing } from "@/components/core/loaders";
import { ReportTimezone } from "@/components/core/report-timezone";
import { Navbar } from "@/components/layout/navbar";
import { isDatabaseReady } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { TRPCReactProvider } from "@/trpc/client";
import { caller, getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

export default async function ConsoleLayout(props: {
	children: React.ReactNode;
	params: Promise<{
		tenant: string;
	}>;
}) {
	const { tenant } = await props.params;
	const { orgSlug } = await getOwner();
	if (tenant !== orgSlug) {
		redirect("/start");
	}

	const ready = await isDatabaseReady();
	if (!ready) {
		redirect("/start");
	}

	const queryClient = getQueryClient();

	const [notificationsWire, userProjects] = await Promise.all([
		caller.user.getNotificationsWire(),
		caller.user.getProjects({
			statuses: ["active"],
		}),
	]);

	void Promise.all([
		queryClient.prefetchQuery(trpc.settings.getTimezone.queryOptions()),
		queryClient.prefetchQuery(trpc.user.getTodayData.queryOptions()),
		queryClient.prefetchQuery(trpc.user.getUserNotifications.queryOptions()),
		queryClient.prefetchQuery(
			trpc.user.getProjects.queryOptions({ statuses: ["active"] }),
		),
		...userProjects.map((project) =>
			queryClient.prefetchQuery(
				trpc.projects.getProjectById.queryOptions({ id: project.id }),
			),
		),
	]);

	return (
		<TRPCReactProvider>
			<HydrationBoundary state={dehydrate(queryClient)}>
				<NuqsAdapter>
					<main className="relative mx-auto w-full flex-grow flex-col">
						<Navbar notificationsWire={notificationsWire} />
						<div className="min-h-[calc(100vh-97px)] bg-background lg:min-w-0 lg:flex-1 pb-8">
							<Suspense fallback={<SpinnerWithSpacing />}>
								{props.children}
							</Suspense>
						</div>

						<ReportTimezone />
					</main>
				</NuqsAdapter>
			</HydrationBoundary>
		</TRPCReactProvider>
	);
}
