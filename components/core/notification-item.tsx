"use client";

import { UserAvatar } from "@/components/core/user-avatar";
import type { NotificationWithUser } from "@/drizzle/types";
import { toDateTimeString } from "@/lib/utils/date";
import { Dot } from "lucide-react";
import Link from "next/link";

export function NotificationItem({
	notification,
	timezone,
}: {
	notification: NotificationWithUser;
	timezone: string;
}) {
	return (
		<div
			key={notification.id}
			className="px-3 py-2 text-sm transition-colors hover:bg-muted-foreground/10"
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
							<span className="font-semibold text-primary hover:underline">
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
	);
}
