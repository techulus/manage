"use client";

import { getUserNotifications } from "@/app/(dashboard)/[tenant]/settings/actions";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { NotificationWithUser } from "@/drizzle/types";
import { socket } from "@/lib/utils/socket-client";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

function Dot({ className }: { className?: string }) {
	return (
		<svg
			width="6"
			height="6"
			fill="currentColor"
			viewBox="0 0 6 6"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden="true"
		>
			<circle cx="3" cy="3" r="3" />
		</svg>
	);
}

function Notifications({ userId }: { userId: string }) {
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		if (socket.connected) {
			onConnect();
		}

		function onConnect() {
			setIsConnected(true);
		}

		function onDisconnect() {
			setIsConnected(false);
		}

		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);

		return () => {
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
		};
	}, []);

	const [notifications, setNotifications] = useState<NotificationWithUser[]>(
		[],
	);
	const unreadCount = notifications.filter((n) => !n.read).length;

	const handleMarkAllAsRead = () => {
		setNotifications(
			notifications.map((notification) => ({
				...notification,
				unread: false,
			})),
		);
	};

	const handleNotificationClick = (id: number) => {
		setNotifications(
			notifications.map((notification) =>
				notification.id === id
					? { ...notification, unread: false }
					: notification,
			),
		);
	};

	const fetchNotifications = useCallback(async () => {
		getUserNotifications().then(setNotifications);
	}, []);

	return (
		<Popover onOpenChange={fetchNotifications}>
			<PopoverTrigger asChild>
				<SidebarMenuItem>
					<SidebarMenuButton asChild>
						<div className="relative flex cursor-pointer">
							<Bell aria-hidden="true" />
							<span>Notifications</span>
						</div>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</PopoverTrigger>
			<PopoverContent className="w-80 ml-4" align="end">
				<div className="flex items-baseline justify-between gap-4 px-3 py-2">
					<div className="text-sm font-semibold">Notifications</div>
					{unreadCount > 0 && (
						<button
							type="button"
							className="text-xs font-medium hover:underline"
							onClick={handleMarkAllAsRead}
						>
							Mark all as read
						</button>
					)}
				</div>
				<div
					aria-orientation="horizontal"
					className="-mx-1 my-1 h-px bg-border"
				/>

				{!notifications.length ? (
					<div className="text-center text-muted-foreground p-6 text-sm">
						No notifications
					</div>
				) : null}

				{notifications.map((notification) => (
					<div
						key={notification.id}
						className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
					>
						<div className="relative flex items-start gap-3 pe-3">
							{/* <img
                className="size-9 rounded-md"
                src={notification.image}
                width={32}
                height={32}
                alt={notification.user}
              /> */}
							<div className="flex-1 space-y-1">
								<button
									type="button"
									className="text-left text-foreground/80 after:absolute after:inset-0"
									onClick={() => handleNotificationClick(notification.id)}
								>
									<span className="font-medium text-foreground hover:underline">
										{notification.user.firstName}
									</span>{" "}
									{notification.target}{" "}
									<span className="font-medium text-foreground hover:underline">
										{notification.target}
									</span>
									.
								</button>
								<div className="text-xs text-muted-foreground">
									{notification.createdAt.toLocaleDateString()}
								</div>
							</div>
							{!notification.read ? (
								<div className="absolute end-0 self-center">
									<Dot />
								</div>
							) : null}
						</div>
					</div>
				))}
			</PopoverContent>
		</Popover>
	);
}

export { Notifications };
