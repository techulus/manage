"use client";

import { getUserNotifications } from "@/app/(dashboard)/[tenant]/settings/actions";
import { cn } from "@/lib/utils";
import { TurboWire } from "@turbowire/web";
import { Bell, Dot } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";

function Notifications({
	tenant,
	notificationsWire,
}: {
	tenant: string;
	notificationsWire: string;
}) {
	const [unreadCount, setUnreadCount] = useState<number>(0);

	const { setOpenMobile } = useSidebar();
	const pathname = usePathname();

	const isActive = pathname === `/${tenant}/notifications`;

	const checkNotifications = useCallback(() => {
		getUserNotifications().then((notifications) => {
			setUnreadCount(notifications.filter((x) => !x.read).length);
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
