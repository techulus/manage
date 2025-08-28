import { redirect } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ReportTimezone } from "@/components/core/report-timezone";
import { Navbar } from "@/components/layout/navbar";
import { isDatabaseReady } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { TRPCReactProvider } from "@/trpc/client";
import { caller } from "@/trpc/server";

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

	// Parallelize database ready check and notifications wire setup
	const [ready, notificationsWire] = await Promise.all([
		isDatabaseReady(),
		caller.user.getNotificationsWire(),
	]);

	if (!ready) {
		redirect("/start");
	}

	return (
		<TRPCReactProvider>
			<NuqsAdapter>
				<main className="relative mx-auto w-full flex-grow flex-col">
					<Navbar notificationsWire={notificationsWire} />
					<div className="min-h-[calc(100vh-97px)] lg:min-w-0 lg:flex-1 pb-8">
						{props.children}
					</div>

					<ReportTimezone />
				</main>
			</NuqsAdapter>
		</TRPCReactProvider>
	);
}
