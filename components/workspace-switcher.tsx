import {
	SidebarMenu,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { OrganizationSwitcher } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export function WorkspaceSwitcher() {
	const { systemTheme } = useTheme();
	const appearance = systemTheme === "dark" ? { baseTheme: dark } : undefined;

	const { open } = useSidebar();
	if (!open) return null;

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<OrganizationSwitcher
					appearance={appearance}
					afterSelectOrganizationUrl="/start"
					afterLeaveOrganizationUrl="/start"
					afterSelectPersonalUrl="/start"
				/>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
