"use client";

import {
	getNotificationsStream,
	getUserNotifications,
} from "@/app/(dashboard)/[tenant]/settings/actions";
import { cn } from "@/lib/utils";
import { useCable } from "@/lib/utils/cable-client";
import type { Channel } from "@anycable/web";
import { Bell, Dot } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";

type NotificationMessage = {
	message?: string;
};

function Notifications({ tenant }: { tenant: string }) {
	const [unreadCount, setUnreadCount] = useState<number>(0);

	const cable = useCable();
	const { setOpenMobile } = useSidebar();
	const pathname = usePathname();

	const isActive = pathname === `/${tenant}/notifications`;

	const checkNotifications = useCallback(() => {
		getUserNotifications().then((notifications) => {
			setUnreadCount(notifications.filter((x) => !x.read).length);
		});
	}, []);

	useEffect(() => {
		if (!cable) return;

		checkNotifications();

		let channel: Channel | undefined;
		getNotificationsStream().then((stream) => {
			channel = cable.streamFromSigned(stream);
			// @ts-ignore
			channel.on("message", (data: NotificationMessage) => {
				if (data?.message) {
					toast(data.message, {
						icon: "🔔",
						duration: 5000,
					});
				}
				checkNotifications();
			});
		});

		return () => {
			channel?.disconnect();
		};
	}, [cable, checkNotifications]);

	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				asChild
				onClick={() => {
					setOpenMobile(false);
				}}
			>
				<Link href={`/${tenant}/notifications`} className="relative flex">
					<Bell className={cn(isActive ? "text-primary" : "")} />
					<span className={cn(isActive ? "font-semibold" : "")}>
						Notifications
					</span>
					<Dot
						className={`ml-auto w-10 h-10 -mr-2 ${
							unreadCount ? "text-red-600" : "text-transparent"
						}`}
					/>
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

export { Notifications };
