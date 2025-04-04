import {
	SidebarMenu,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { OrganizationSwitcher } from "@clerk/nextjs";

export function WorkspaceSwitcher() {
	const { open } = useSidebar();
	if (!open) return null;

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<OrganizationSwitcher
					afterSelectOrganizationUrl="/start"
					afterLeaveOrganizationUrl="/start"
					afterSelectPersonalUrl="/start"
				/>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
