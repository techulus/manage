"use client";

import { PageLoading } from "@/components/core/loaders";
import { Spinner } from "@/components/core/loaders";
import { NotificationItem } from "@/components/core/notification-item";
import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueries } from "@tanstack/react-query";

export default function Notifications() {
	const trpc = useTRPC();

	const [
		{ data: notifications, isLoading: notificationsLoading },
		{ data: timezone, isLoading: timezoneLoading },
	] = useQueries({
		queries: [
			trpc.user.getUserNotifications.queryOptions(),
			trpc.settings.getTimezone.queryOptions(),
		],
	});

	const markNotificationsAsRead = useMutation(
		trpc.user.markNotificationsAsRead.mutationOptions(),
	);

	if (notificationsLoading || timezoneLoading || !timezone) {
		return <PageLoading />;
	}

	return (
		<>
			<PageTitle title="Notifications">
				<Button
					variant="outline"
					size="sm"
					onClick={() => markNotificationsAsRead.mutate()}
					disabled={markNotificationsAsRead.isPending}
				>
					{markNotificationsAsRead.isPending ? (
						<Spinner className="h-4 w-4" />
					) : (
						<>Mark all as read</>
					)}
				</Button>
			</PageTitle>

			<PageSection className="overflow-hidden">
				{!notifications?.length ? (
					<div className="text-center text-muted-foreground p-6 text-sm">
						No notifications
					</div>
				) : null}

				{notifications?.map((notification) => (
					<NotificationItem
						key={notification.id}
						notification={notification}
						timezone={timezone}
					/>
				))}
			</PageSection>
		</>
	);
}
