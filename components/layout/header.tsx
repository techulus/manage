import Image from "next/image";
import Link from "next/link";
import logo from "../../public/images/logo.png";
import { buttonVariants } from "../ui/button";

export async function Header() {
	return (
		<header className="absolute inset-x-0 top-0 z-50 text-black dark:text-white">
			<nav
				className="flex items-center justify-between p-6 lg:px-8"
				aria-label="Global"
			>
				<div className="flex lg:flex-1">
					<Image
						src={logo}
						alt="Manage"
						width={32}
						height={32}
						className="-mt-2 mr-2 rounded-sm"
					/>

					<Link href="/" className="-m-1.5 p-1.5" prefetch={false}>
						<p className="relative tracking-tight">
							Manage
							<sup className="absolute left-[calc(100%+.1rem)] top-0 text-xs">
								[beta]
							</sup>
						</p>
					</Link>
				</div>

				<Link
					className={buttonVariants({ size: "sm", variant: "outline" })}
					href="/start"
					prefetch={false}
				>
					Console
				</Link>
			</nav>
		</header>
	);
}
