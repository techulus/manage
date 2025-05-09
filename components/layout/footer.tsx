import Link from "next/link";

const navigation = {
	main: [
		{ name: "Status", href: "https://manage.openstatus.dev" },
		{ name: "Terms", href: "/terms" },
		{ name: "Privacy", href: "/privacy" },
		{ name: "Source code", href: "https://github.com/techulus/manage" },
	],
};

export function Footer() {
	return (
		<footer className="border-t">
			<div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
				<nav
					className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12"
					aria-label="Footer"
				>
					{navigation.main.map((item) => (
						<div key={item.name} className="pb-6">
							<Link
								href={item.href}
								className="text-sm font-semibold leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
							>
								{item.name}
							</Link>
						</div>
					))}
				</nav>

				<p className="mt-4 text-sm leading-5 text-gray-500 sm:text-center">
					&copy; {new Date().getFullYear()} Techulus. All rights reserved.
				</p>
			</div>
		</footer>
	);
}
