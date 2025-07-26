import Link from "next/link";

function CTA() {
	return (
		<section className="py-24 sm:py-32 bg-white dark:bg-gray-800">
			<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
				<h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
					Ready to get started?
				</h2>
				<p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
					Join the beta and help shape the future of project management.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
					<Link
						href="/start"
						className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-green-600 rounded-lg shadow-lg shadow-green-600/25 border-b-4 border-green-700 hover:bg-green-500 hover:border-green-600 active:border-green-600 active:shadow-md active:translate-y-0.5 transition-all duration-150"
					>
						Start for free →
					</Link>
					<Link
						href="https://github.com/techulus/manage"
						className="text-lg font-semibold text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
					>
						View on GitHub
					</Link>
				</div>
			</div>
		</section>
	);
}

export { CTA };
