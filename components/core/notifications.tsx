"use client";

import { getUserNotifications } from "@/app/(dashboard)/[tenant]/settings/actions";
import { cn } from "@/lib/utils";
import { Bell, Dot } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

function Notifications({ tenant, userId }: { tenant: string; userId: string }) {
	const pathname = usePathname();

	const isActive = pathname === `/${tenant}/notifications`;

	useEffect(() => {
		getUserNotifications().then((notifications) => {
			setUnreadCount(notifications.filter((x) => !x.read).length);
		});
	}, []);

	const [unreadCount, setUnreadCount] = useState<number>(0);

	return (
		<SidebarMenuItem>
			<SidebarMenuButton asChild>
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
