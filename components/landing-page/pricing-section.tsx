import { CheckCircleIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";

export function PricingSection() {
	return (
		<section className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-900">
			<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
				<h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
					Simple pricing
				</h2>
				<p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
					Free during beta. Fair pricing when we launch.
				</p>
				
				<div className="inline-block p-8 bg-white rounded-2xl shadow-lg dark:bg-gray-800 text-left max-w-md">
					<div className="text-center mb-6">
						<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
							Beta Access
						</h3>
						<div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
							Free
						</div>
						<p className="text-gray-600 dark:text-gray-400">
							Until launch
						</p>
					</div>
					
					<ul className="space-y-3 mb-8">
						{[
							"Unlimited projects",
							"Team collaboration",
							"File sharing",
							"Real-time updates",
							"Priority support"
						].map((feature) => (
							<li key={feature} className="flex items-center">
								<CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 flex-shrink-0" />
								<span className="text-gray-700 dark:text-gray-300">{feature}</span>
							</li>
						))}
					</ul>
					
					<Link
						href="/start"
						className="w-full block text-center bg-green-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg shadow-green-600/25 border-b-4 border-green-700 hover:bg-green-500 hover:border-green-600 active:border-green-600 active:shadow-md active:translate-y-0.5 transition-all duration-150"
					>
						Get started free
					</Link>
				</div>
			</div>
		</section>
	);
}
