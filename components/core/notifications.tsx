"use client";

import type { Notification } from "@/drizzle/types";
import { TurboWire } from "@turbowire/web";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export function Notifications({
	notificationsWire,
}: {
	notificationsWire: string;
}) {
	const [unreadCount, setUnreadCount] = useState<number>(0);

	const checkNotifications = useCallback(() => {
		fetch("/api/user/notifications")
			.then((res) => res.json())
			.then((data) => {
				setUnreadCount(data.filter((x: Notification) => !x.read).length);
			});
	}, []);

	useEffect(() => {
		if (!notificationsWire) return;

		checkNotifications();

		const wire = new TurboWire(notificationsWire);
		wire.connect((message) => {
			try {
				const data = JSON.parse(message);
				if (data?.message) {
					toast.info(data.message);
				}
				checkNotifications();
			} catch (error) {
				console.error(error);
			}
		});

		return () => {
			wire?.disconnect();
		};
	}, [checkNotifications, notificationsWire]);

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
			<PopoverContent className="w-80" align="end">
				<div className="flex flex-col space-y-4 p-2">
					<h3 className="font-medium">Notifications</h3>
					<div className="text-sm text-muted-foreground">
						You have no new notifications.
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
