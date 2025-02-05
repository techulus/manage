import PageSection from "@/components/core/section";
import { UserAvatar } from "@/components/core/user-avatar";
import PageTitle from "@/components/layout/page-title";
import { toDateTimeString } from "@/lib/utils/date";
import { getTimezone } from "@/lib/utils/useOwner";
import { Dot } from "lucide-react";
import Link from "next/link";
import {
	getUserNotifications,
	markAllNotificationsAsRead,
} from "../settings/actions";
import { Button } from "@/components/ui/button";

export default async function Notifications() {
	const notifications = await getUserNotifications();
	const timezone = await getTimezone();

	return (
		<>
			<PageTitle title="Notifications">
				<form action={markAllNotificationsAsRead}>
					<Button type="submit" variant="outline" size="sm">
						Mark all as read
					</Button>
				</form>
			</PageTitle>

			<PageSection topInset>
				{!notifications.length ? (
					<div className="text-center text-muted-foreground p-6 text-sm">
						No notifications
					</div>
				) : null}

				{notifications.map((notification) => (
					<div
						key={notification.id}
						className="px-3 py-2 text-sm transition-colors hover:bg-accent"
					>
						<div className="relative flex items-start gap-3 pe-3">
							{notification.fromUser ? (
								<UserAvatar user={notification.fromUser} />
							) : null}
							<div className="flex-1 space-y-1">
								<Link
									href={notification.target ?? "#"}
									className="text-left text-foreground/80 after:absolute after:inset-0"
								>
									{notification.fromUser ? (
										<span className="font-medium text-foreground hover:underline">
											{notification.fromUser.firstName}
										</span>
									) : null}{" "}
									{notification.message}
								</Link>
								<div className="text-xs text-muted-foreground">
									{toDateTimeString(notification.createdAt, timezone)}
								</div>
							</div>
							{!notification.read ? (
								<div className="absolute end-0 self-center">
									<Dot className="ml-auto w-10 h-10 -mr-2 text-red-600" />
								</div>
							) : null}
						</div>
					</div>
				))}
			</PageSection>
		</>
	);
}
