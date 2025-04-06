"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { TurboWire } from "@turbowire/web";
import { Bell } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { SpinnerWithSpacing } from "./loaders";
import { NotificationItem } from "./notification-item";

export function Notifications({
	notificationsWire,
}: {
	notificationsWire: string;
}) {
	const trpc = useTRPC();
	const { data: notifications, isLoading: notificationsLoading } = useQuery(
		trpc.user.getUserNotifications.queryOptions(),
	);
	const { data: timezone, isLoading: timezoneLoading } = useQuery(
		trpc.settings.getTimezone.queryOptions(),
	);

	const unreadCount = notifications?.filter((x) => !x.read).length;

	useEffect(() => {
		if (!notificationsWire) return;

		const wire = new TurboWire(notificationsWire);
		wire.connect((message) => {
			try {
				const data = JSON.parse(message);
				if (data?.message) {
					toast.info(data.message);
				}
			} catch (error) {
				console.error(error);
			}
		});

		return () => {
			wire?.disconnect();
		};
	}, [notificationsWire]);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<Bell className="h-5 w-5" />
					{unreadCount ? (
						<span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
					) : null}
					<span className="sr-only">Notifications</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 sm:w-96 p-0" align="end">
				{notificationsLoading || timezoneLoading ? (
					<SpinnerWithSpacing />
				) : (
					<div className="flex flex-col">
						<h3 className="font-medium px-4 py-2">Notifications</h3>
						{notifications?.length && timezone ? (
							<div className="flex flex-col divide-y">
								{notifications.map((notification) => (
									<NotificationItem
										key={notification.id}
										notification={notification}
										timezone={timezone}
									/>
								))}
							</div>
						) : (
							<div className="text-sm text-muted-foreground">
								You have no new notifications.
							</div>
						)}
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
