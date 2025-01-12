import { Header } from "@/components/layout/header";

export default function TermsAndConditions() {
	return (
		<div className="h-full dark:text-gray-100">
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
				<div className="mx-auto max-w-2xl py-32">
					<h1 className="mb-4 text-2xl font-bold">Terms and Conditions</h1>

					<div className="mb-8">
						<h2 className="mb-2 text-xl font-bold">1. Introduction</h2>
						<p className="mb-4">
							Welcome to Manage! These terms and conditions outline the rules
							and regulations for the use of our Open Source SaaS product.
						</p>
					</div>

					<div className="mb-8">
						<h2 className="mb-2 text-xl font-bold">2. No Liability</h2>
						<p className="mb-4">
							As the developer and provider of Manage, I hereby declare that I
							bear no liability for any damages, losses, or legal issues that
							may arise from the use or misuse of this product. By using Manage,
							you agree to indemnify and hold me harmless from any such claims.
						</p>
					</div>

					<div className="mb-8">
						<h2 className="mb-2 text-xl font-bold">3. Intellectual Property</h2>
						<p className="mb-4">
							Manage is an Open Source SaaS product released under the terms of
							the GNU General Public License (GPL). All intellectual property
							rights, including but not limited to copyrights, trademarks, and
							patents, are retained by their respective owners.
						</p>
					</div>

					<div className="mb-8">
						<h2 className="mb-2 text-xl font-bold">4. Limitations</h2>
						<p className="mb-4">
							Manage is provided &quot;as is&quot; and without any warranty,
							whether express or implied. I do not guarantee the accuracy,
							reliability, or suitability of Manage for any particular purpose.
							You are solely responsible for the use and implementation of
							Manage.
						</p>
					</div>

					<div className="mb-8">
						<h2 className="mb-2 text-xl font-bold">5. Modifications</h2>
						<p className="mb-4">
							I reserve the right to modify or replace these terms and
							conditions at any time without prior notice. It is your
							responsibility to review these terms and conditions periodically
							for any changes.
						</p>
					</div>

					<p className="mb-4">
						By using Manage, you agree to be bound by these terms and
						conditions.
					</p>
				</div>
			</div>
		</div>
	);
}
