import { NotificationItem } from "@/components/core/notification-item";
import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { Button } from "@/components/ui/button";
import { caller } from "@/trpc/server";
import { markAllNotificationsAsRead } from "../settings/actions";

export default async function Notifications() {
	const [notifications, timezone] = await Promise.all([
		caller.user.getUserNotifications(),
		caller.settings.getTimezone(),
	]);

	return (
		<>
			<PageTitle title="Notifications">
				<form action={markAllNotificationsAsRead}>
					<Button type="submit" variant="outline" size="sm">
						Mark all as read
					</Button>
				</form>
			</PageTitle>

			<PageSection topInset className="overflow-hidden">
				{!notifications.length ? (
					<div className="text-center text-muted-foreground p-6 text-sm">
						No notifications
					</div>
				) : null}

				{notifications.map((notification) => (
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
