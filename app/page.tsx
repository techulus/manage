import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { buttonVariants } from "@/components/ui/button";
import { SITE_METADATA } from "@/data/marketing";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import Link from "next/link";

export const revalidate = 86400;

async function getGitHubStars(): Promise<string | null> {
	try {
		const response = await fetch(
			"https://api.github.com/repos/techulus/manage",
			{
				headers: {
					Accept: "application/vnd.github+json",
				},
			},
		);

		if (!response?.ok) {
			return null;
		}

		const json = await response.json();

		return Number.parseInt(json.stargazers_count).toLocaleString();
	} catch (error) {
		return null;
	}
}

const tiers = [
	{
		name: "Self-hosted",
		id: "tier-free",
		priceMonthly: "$0",
		description: "You can host it yourself",
		features: [
			"Unlimited users",
			"Unlimited projects",
			"Unlimited storage",
			"Community support",
		],
		featured: false,
		href: "https://github.com/techulus/manage",
		callToAction: "Get Started",
	},
	{
		name: "Scale",
		id: "tier-scale",
		priceMonthly: "$99",
		description: "A plan that scales with your rapidly growing business.",
		features: [
			"Upto 50 users",
			"Unlimited projects",
			"Multiple organizations",
			"200 GB storage",
			"Priority support",
		],
		featured: true,
		href: "mailto:hello+scale@managee.xyz",
		callToAction: "Request access",
	},
	{
		name: "Solo",
		id: "tier-solo",
		priceMonthly: "$5",
		description: "The perfect plan if you're working solo",
		features: ["Single user", "10 projects", "5 GB storage", "Email support"],
		featured: false,
		href: "mailto:hello@managee.xyz",
		callToAction: "Request access",
	},
];

export default async function Home() {
	const stars = (await getGitHubStars()) ?? "-";

	return (
		<div className="h-full">
			<Header />

			<div className="relative isolate px-6 pt-14 lg:px-8">
				<div
					className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
					aria-hidden="true"
				>
					<div
						className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#0d9488] to-[#2dd4bf] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
						style={{
							clipPath:
								"polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
						}}
					/>
				</div>
				<div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
					<div className="text-center">
						<h1 className="text-hero bg-gradient-to-r from-green-500 to-yellow-700 bg-clip-text text-4xl tracking-tighter text-gray-900 text-transparent sm:text-6xl">
							{SITE_METADATA.TAGLINE}
						</h1>
						<p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
							{SITE_METADATA.DESCRIPTION}
						</p>
						<div className="mt-10 flex flex-col items-center justify-center gap-y-6 md:flex-row md:gap-x-6 md:gap-y-0">
							{/* <Link
                href="/start"
                prefetch={false}
              >
                Get started
              </Link> */}

							<Link
								href="https://github.com/techulus/manage"
								target="_blank"
								rel="noreferrer"
								className="flex"
								prefetch={false}
							>
								<div className="flex h-10 w-10 items-center justify-center space-x-2 rounded-md border border-muted bg-muted">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="currentColor"
										viewBox="0 0 24 24"
										className="h-5 w-5 text-foreground"
									>
										<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
									</svg>
								</div>
								<div className="flex items-center">
									<div className="h-4 w-4 border-y-8 border-l-0 border-r-8 border-solid border-muted border-y-transparent" />
									<div className="flex h-10 items-center rounded-md border border-muted bg-muted px-4 font-medium">
										{stars} stars on GitHub
									</div>
								</div>
							</Link>
						</div>
					</div>
				</div>
				<div
					className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
					aria-hidden="true"
				>
					<div
						className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#0d9488] to-[#2dd4bf] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
						style={{
							clipPath:
								"polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
						}}
					/>
				</div>
			</div>

			<div className="relative isolate px-6 py-24 sm:py-32 lg:px-8">
				<div
					className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl"
					aria-hidden="true"
				>
					<div
						className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#0d9488] to-[#2dd4bf] opacity-30"
						style={{
							clipPath:
								"polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
						}}
					/>
				</div>
				<div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
					<h2 className="text-base font-semibold leading-7 text-primary">
						Pricing
					</h2>
					<p className="text-hero mt-2 text-4xl tracking-tighter text-gray-900 dark:text-gray-50 sm:text-5xl">
						From Solo to Scale
					</p>
				</div>
				<p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-gray-300">
					This project is still under development and is currently in beta, the
					pricing is subject to change.
				</p>

				<div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-3">
					{tiers.map((tier, tierIdx) => (
						<div
							key={tier.id}
							className={cn(
								tier.featured
									? "relative bg-white shadow-2xl dark:bg-gray-900"
									: "bg-white/60 dark:bg-gray-900/60 sm:mx-8 lg:mx-0",
								tier.featured
									? ""
									: tierIdx === 0
										? "rounded-t-3xl sm:rounded-b-none lg:rounded-bl-3xl lg:rounded-tr-none"
										: "sm:rounded-t-none lg:rounded-bl-none lg:rounded-tr-3xl",
								"rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10",
							)}
						>
							<h3
								id={tier.id}
								className="text-base font-semibold leading-7 text-primary"
							>
								{tier.name}
							</h3>
							<p className="mt-4 flex items-baseline gap-x-2">
								<span className="text-hero text-5xl tracking-tighter text-gray-900 dark:text-gray-50">
									{tier.priceMonthly}
								</span>
								<span className="text-base text-gray-500 dark:text-gray-400">
									/month
								</span>
							</p>
							<p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-300">
								{tier.description}
							</p>
							<ul className="mt-8 space-y-3 text-sm leading-6 text-gray-600 dark:text-gray-300 sm:mt-10">
								{tier.features.map((feature) => (
									<li key={feature} className="flex gap-x-3">
										<CheckIcon
											className="h-6 w-5 flex-none text-primary"
											aria-hidden="true"
										/>
										{feature}
									</li>
								))}
							</ul>
							<a
								href={tier.href}
								className={cn(
									buttonVariants({
										variant: tier.featured ? "default" : "outline",
									}),
									"mt-8 w-full",
								)}
							>
								{tier.callToAction}
							</a>
						</div>
					))}
				</div>
			</div>

			<Footer />
		</div>
	);
}
