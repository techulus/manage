import { logtoConfig } from "@/app/logto";
import { getLogtoContext, signIn } from "@logto/next/server-actions";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/images/logo.png";

export async function Header() {
	const { isAuthenticated } = await getLogtoContext(logtoConfig);

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
						className="-mt-2 mr-2 rounded-md"
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

				{isAuthenticated ? (
					<Link href="/start" prefetch={false}>
						Console
					</Link>
				) : (
					<button
						type="button"
						onClick={async () => {
							"use server";
							await signIn(logtoConfig);
						}}
					>
						Sign in
					</button>
				)}
			</nav>
		</header>
	);
}
