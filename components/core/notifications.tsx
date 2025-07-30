"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { TurboWire } from "@turbowire/web";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
	const params = useParams();
	const tenant = params.tenant as string;
	const trpc = useTRPC();
	const {
		data: notifications,
		isLoading: notificationsLoading,
		refetch: refetchNotifications,
	} = useQuery(trpc.user.getUserNotifications.queryOptions());
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
				refetchNotifications();
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
	}, [notificationsWire, refetchNotifications]);

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
						<div className="flex items-center justify-between px-4 py-2 border-b dark:border-white/10">
							<h3 className="font-medium">Notifications</h3>
							{tenant && (
								<Link href={`/${tenant}/notifications`}>
									<Button variant="ghost" size="sm" className="text-xs">
										View all
									</Button>
								</Link>
							)}
						</div>
						{notifications?.length && timezone ? (
							<div className="flex flex-col divide-y dark:divide-white/10">
								{notifications.map((notification) => (
									<NotificationItem
										key={notification.id}
										notification={notification}
										timezone={timezone}
									/>
								))}
							</div>
						) : (
							<div className="text-sm text-muted-foreground px-4 py-2">
								You have no new notifications.
							</div>
						)}
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
