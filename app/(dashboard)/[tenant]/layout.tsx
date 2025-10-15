import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ClientRedirect } from "@/components/core/client-redirect";
import { ReportTimezone } from "@/components/core/report-timezone";
import { Navbar } from "@/components/layout/navbar";
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
		return <ClientRedirect path="/start" />;
	}

	const notificationsWire = await caller.user.getNotificationsWire();

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
