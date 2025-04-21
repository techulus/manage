import Link from "next/link";
import { buttonVariants } from "../ui/button";

function CTA() {
	return (
		<div className="w-full py-8">
			<div className="mx-auto max-w-7xl px-6 sm:py-24 lg:px-8">
				<h2 className="max-w-2xl text-balance text-xl font-semibold sm:text-5xl">
					<span className="text-primary font-extrabold">Boost</span> your
					productivity. Start using{" "}
					<span className="text-primary font-extrabold">Manage</span> today.
				</h2>
				<div className="mt-10 flex items-center gap-x-6">
					<Link
						href="http://github.com/techulus/manage"
						className={buttonVariants({
							variant: "default",
							className: "flex items-center gap-2 p-8",
						})}
					>
						Find on GitHub
					</Link>
				</div>
			</div>
		</div>
	);
}

export { CTA };
