import {
	SidebarMenu,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";

export function NavUser() {
	const { open } = useSidebar();
	if (!open) return null;

	return (
		<SidebarMenu className="pb-8 md:pb-0">
			<SidebarMenuItem className="p-2">
				<UserButton showName />
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
