import type { Organization } from "@/lib/ops/auth";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/images/logo.png";
import { OrgSwitcher, UserButton } from "../core/auth";
import NavBarLinks from "./navbar-links";

export default function NavBar({
	orgs,
	activeOrg,
}: {
	orgs: Organization[];
	activeOrg: Organization | null;
}) {
	const orgSlug = "personal";

	return (
		<>
			<nav className="flex-shrink-0 bg-background text-black dark:bg-gray-950 dark:text-white">
				<div className="mx-auto px-4 lg:px-8">
					<div className="relative flex h-16 items-center justify-between">
						<div className="ml-1 flex items-center justify-center">
							<Link href={`/${orgSlug}/projects`} prefetch={false}>
								<div className="lg:px-0">
									<Image
										src={logo}
										alt="Manage"
										width={40}
										height={40}
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
								width="40"
								className="ml-2 text-gray-300 dark:text-gray-700 xl:block"
							>
								<path d="M16.88 3.549L7.12 20.451" />
							</svg>

							<OrgSwitcher orgs={orgs} activeOrg={activeOrg} />
						</div>

						<div className="ml-2 flex justify-center">
							<UserButton orgSlug={orgSlug} />
						</div>
					</div>
				</div>
			</nav>

			<NavBarLinks />
		</>
	);
}
