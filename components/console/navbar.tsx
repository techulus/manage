import type { Project } from "@/drizzle/types";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/images/logo.png";
import { OrgSwitcher, ProjectSwitcher, UserButton } from "../core/auth";
import NavBarLinks from "./navbar-links";
import { Notifications } from "./notifications";

export default function NavBar({
	userId,
	activeOrgId,
	activeOrgSlug,
	projects,
}: {
	userId: string;
	activeOrgId: string;
	activeOrgSlug: string;
	projects: Project[];
}) {
	return (
		<>
			<nav className="flex-shrink-0 bg-background text-black dark:bg-gray-950 dark:text-white">
				<div className="mx-auto px-4 lg:px-8">
					<div className="relative flex h-16 items-center justify-between">
						<div className="ml-1 flex items-center justify-center">
							<Link href={`/${activeOrgSlug}/projects`} prefetch={false}>
								<div className="lg:px-0">
									<Image
										src={logo}
										alt="Manage"
										width={30}
										height={30}
										className="rounded-md"
									/>
								</div>
							</Link>

							<svg
								fill="none"
								height="32"
								shapeRendering="geometricPrecision"
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="1"
								viewBox="0 0 24 24"
								width="32"
								className="text-gray-300 dark:text-gray-700 xl:block"
							>
								<path d="M16.88 3.549L7.12 20.451" />
							</svg>

							<OrgSwitcher activeOrgId={activeOrgId} />

							<ProjectSwitcher projects={projects} />
						</div>

						<div className="ml-2 flex justify-center space-x-2">
							<Notifications userId={userId} />
							<UserButton orgSlug={activeOrgSlug} />
						</div>
					</div>
				</div>
			</nav>

			<NavBarLinks orgSlug={activeOrgSlug} />
		</>
	);
}
