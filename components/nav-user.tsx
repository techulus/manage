import {
	SidebarMenu,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export function NavUser() {
	const { systemTheme } = useTheme();
	const appearance = systemTheme === "dark" ? { baseTheme: dark } : undefined;

	const { open } = useSidebar();
	if (!open) return null;

	return (
		<SidebarMenu className="pb-8 md:pb-0">
			<SidebarMenuItem className="p-2">
				<UserButton showName appearance={appearance} />
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
