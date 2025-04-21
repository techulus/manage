import { CTA } from "@/components/landing-page/call-to-action";
import { FeaturesSection } from "@/components/landing-page/feature-section";
import { PricingSection } from "@/components/landing-page/pricing-section";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SITE_METADATA } from "@/data/marketing";
import events from "@/public/screenshots/events.png";
import overview from "@/public/screenshots/overview.png";
import tasks from "@/public/screenshots/tasks.png";
import Image from "next/image";

const features = [
	{
		name: "task",
		image: tasks,
		title: "Everything you need to manage your tasks",
		highlight: "manage",
	},
	{
		name: "events",
		image: events,
		title: "Stay on top of important events",
		highlight: "events",
	},
];

export default async function Home() {
	return (
		<div className="h-full">
			<Header />

			<div className="relative isolate pt-14 overflow-hidden">
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
				<div className="py-24 sm:py-32 lg:pb-40">
					<div className="mx-auto max-w-7xl px-6 lg:px-8">
						<div className="mx-auto max-w-2xl text-center">
							<h1 className="text-hero bg-gradient-to-r from-green-500 to-yellow-700 bg-clip-text text-2xl tracking-tighter text-gray-900 text-transparent sm:text-6xl whitespace-pre-line">
								{SITE_METADATA.TAGLINE}
							</h1>
							<p className="mt-6 p-3 text-lg leading-8 text-gray-600 dark:text-gray-400">
								{SITE_METADATA.DESCRIPTION}
							</p>
						</div>
						<div className="mt-16 flow-root sm:mt-24">
							<div className="relative mt-16 h-auto w-[calc(theme(maxWidth.7xl)-theme(spacing.16))]">
								<Image
									alt="App screenshot"
									src={overview}
									className="rounded-md shadow-2xl ring-1 ring-green-900/10"
								/>
							</div>
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

				<div className="overflow-hidden py-24 sm:py-32">
					<div className="mx-auto max-w-7xl px-6 lg:px-8">
						{features.map((feature) => (
							<div key={feature.name} className="mb-24 last:mb-0">
								<p className="max-w-2xl text-pretty text-5xl font-semibold tracking-tighter text-gray-900 dark:text-gray-100 sm:text-balance sm:text-6xl">
									{feature.title
										.split(feature.highlight)
										.map((part, i, arr) => (
											<span key={part}>
												{part}
												{i < arr.length - 1 && (
													<span className="text-primary">
														{feature.highlight}
													</span>
												)}
											</span>
										))}
								</p>
								<div className="relative mt-16 h-auto w-[calc(theme(maxWidth.7xl)-theme(spacing.16))]">
									<Image
										alt={`${feature.name} screenshot`}
										src={feature.image}
										className="rounded-md shadow-2xl ring-1 ring-green-900/10 dark:ring-green-50/10"
									/>
								</div>
							</div>
						))}
					</div>
				</div>

				<FeaturesSection />

				<PricingSection />

				<CTA />
			</div>

			<Footer />
		</div>
	);
}
