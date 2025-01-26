import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

function CTA() {
	return (
		<div className="w-full py-20 lg:py-40">
			<div className="mx-auto max-w-7xl px-6 sm:py-24 lg:px-8">
				<h2 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
					Boost your productivity. Start using 'Manage' today.
				</h2>
				<div className="mt-10 flex items-center gap-x-6">
					<Link
						href="http://github.com/techulus/manage"
						className={buttonVariants({
							variant: "default",
							className: "flex items-center gap-2 p-8",
						})}
					>
						Get Started
					</Link>
					<Link
						href="mailto:arjun@techulus.com"
						className={buttonVariants({
							variant: "ghost",
							className: "flex items-center gap-2 p-8",
						})}
					>
						Request Access
					</Link>
				</div>
			</div>
		</div>
	);
}

export { CTA };
