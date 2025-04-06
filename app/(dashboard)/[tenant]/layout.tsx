import { SpinnerWithSpacing } from "@/components/core/loaders";
import { ReportTimezone } from "@/components/core/report-timezone";
import { Navbar } from "@/components/layout/navbar";
import { isDatabaseReady } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { caller } from "@/trpc/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

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

	const notificationsWire = await caller.user.getNotificationsWire();

	return (
		<main className="relative mx-auto w-full flex-grow flex-col">
			<Navbar notificationsWire={notificationsWire} />
			<div className="min-h-screen bg-background lg:min-w-0 lg:flex-1 pb-8">
				<Suspense fallback={<SpinnerWithSpacing />}>{children}</Suspense>
			</div>

			<ReportTimezone />
		</main>
	);
}
