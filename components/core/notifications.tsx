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
import { useEffect, useState } from "react";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";

function Notifications({ tenant }: { tenant: string }) {
	const cable = useCable();
	const { setOpenMobile } = useSidebar();
	const pathname = usePathname();

	const isActive = pathname === `/${tenant}/notifications`;

	useEffect(() => {
		if (!cable) return;

		let channel: Channel | undefined;

		getNotificationsStream().then((stream) => {
			channel = cable.streamFromSigned(stream);
			channel.on("message", (_) => {
				getUserNotifications().then((notifications) => {
					setUnreadCount(notifications.filter((x) => !x.read).length);
				});
			});
		});

		return () => {
			channel?.disconnect();
		};
	}, [cable]);

	const [unreadCount, setUnreadCount] = useState<number>(0);

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
