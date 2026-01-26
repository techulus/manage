import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { ClientRedirect } from "@/components/core/client-redirect";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { auth } from "@/lib/auth";
import { isSelfHosted, isSignupDisabled } from "@/lib/config";

export default async function Home() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (session?.user) {
		return <ClientRedirect path="/start" />;
	}

	if (isSelfHosted()) {
		return <ClientRedirect path="/sign-in" />;
	}

	const signupsDisabled = isSignupDisabled();

	return (
		<div className="min-h-screen">
			<Header disableSignups={signupsDisabled} />

			<section>
				<div className="mx-auto max-w-7xl relative border border-gray-200 dark:border-gray-800 pb-24 pt-8 px-6">
					<div className="absolute -top-3 -left-3 w-6 h-6 flex items-center justify-center text-primary text-xl font-light">
						+
					</div>
					<div className="absolute -bottom-3 -right-3 w-6 h-6 flex items-center justify-center text-primary text-xl font-light">
						+
					</div>
					<div className="text-center mt-12">
						<div className="mb-6">
							<span className="relative inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-green-700 dark:text-green-300">
								<span className="w-2 h-2 bg-green-500 animate-pulse rounded-lg" />
								Open Source Project Management
								<div className="absolute bottom-1 left-0 right-0 h-8 bg-green-200/20 dark:bg-green-400/30 -skew-x-12" />
							</span>
						</div>
						<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.02em] text-gray-900 dark:text-white leading-[0.9] mb-8">
							Tired of complex project tools? <br />
							Meet{" "}
							<span className="text-green-600 dark:text-green-400">
								beautiful simplicity
							</span>
							.
						</h1>
						<p className="mt-8 text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
							Self-hostable, developer-friendly project management. All the
							power you need, none of the bloat you don't. Built with modern
							tech stack and open source values.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
							{!signupsDisabled && (
								<Link
									href="/start"
									className="inline-block bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-sm shadow-green-600/25 border-b-4 border-green-700 hover:bg-green-500 hover:border-green-600 active:border-green-600 active:shadow-sm active:translate-y-0.5 transition-all duration-150 dark:bg-green-600 dark:border-green-700 dark:hover:bg-green-500 dark:hover:border-green-600"
								>
									Try Manage →
								</Link>
							)}
							<Link
								href="https://github.com/techulus/manage"
								className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold border-2 border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
							>
								<svg
									className="w-5 h-5"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
										clipRule="evenodd"
									/>
								</svg>
								View on GitHub
							</Link>
						</div>
					</div>
				</div>
			</section>

			<div className="mx-auto max-w-7xl text-center relative z-10 border-l border-r border-b border-gray-200 dark:border-gray-800 pt-24">
				<h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-gray-900 dark:text-white leading-tight px-6">
					Essential tools that keep your team{" "}
					<span className="text-green-600 dark:text-green-400 relative">
						productive
						<div className="absolute bottom-1 left-0 right-0 h-8 bg-green-200/20 dark:bg-green-400/30 -skew-x-12" />
					</span>
				</h2>
				<p className="text-xl text-gray-600 dark:text-gray-300 mb-20 max-w-3xl mx-auto leading-relaxed px-6">
					Tasks, Events, Files, Docs, and more — beautifully designed and
					thoughtfully integrated for maximum efficiency.
				</p>

				<div className="relative">
					<div className="absolute -top-3 -left-3 w-6 h-6 flex items-center justify-center text-primary text-xl font-light z-10">
						+
					</div>
					<div className="absolute -bottom-3 -right-3 w-6 h-6 flex items-center justify-center text-primary text-xl font-light z-10">
						+
					</div>
				</div>
			</div>

			<section>
				<div className="mx-auto max-w-7xl relative border-l border-r border-gray-800">
					<div className="absolute -top-3 -left-3 w-6 h-6 flex items-center justify-center text-gray-600 text-xl font-light z-10">
						+
					</div>
					<div className="absolute -bottom-3 -right-3 w-6 h-6 flex items-center justify-center text-gray-600 text-xl font-light z-10">
						+
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2">
						{/* Project Dashboard Card */}
						<div className="relative border border-gray-800 p-8 bg-gray-950 hover:border-gray-700 transition-colors">
							<div className="flex items-center gap-2 mb-4">
								<svg
									className="w-4 h-4 text-gray-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/>
								</svg>
								<span className="text-gray-400 text-sm">Project Overview</span>
							</div>
							<h3 className="text-2xl font-bold mb-3">
								Real-time project insights.
							</h3>
							<p className="text-gray-400 mb-6 leading-relaxed">
								Monitor project progress and resource allocation through
								intuitive dashboards and analytics.
							</p>
							<div className="relative overflow-hidden">
								<Image
									src="/screenshots/overview.png"
									alt="Project overview dashboard"
									width={800}
									height={600}
									className="w-full h-auto"
									priority
								/>
							</div>
						</div>

						{/* Task Management Card */}
						<div className="relative border border-gray-800 p-8 bg-gray-950 hover:border-gray-700 transition-colors">
							<div className="flex items-center gap-2 mb-4">
								<svg
									className="w-4 h-4 text-gray-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
									/>
								</svg>
								<span className="text-gray-400 text-sm">Task Management</span>
							</div>
							<h3 className="text-2xl font-bold mb-3">
								Organize work, deliver faster.
							</h3>
							<p className="text-gray-400 mb-6 leading-relaxed">
								Create task lists, set priorities, assign team members, and
								track progress with powerful workflow automation.
							</p>
							<div className="relative overflow-hidden">
								<Image
									src="/screenshots/tasks.png"
									alt="Task management interface"
									width={800}
									height={600}
									className="w-full h-auto"
									priority
								/>
							</div>
						</div>

						{/* Calendar & Events Card */}
						<div className="relative border border-gray-800 p-8 bg-gray-950 hover:border-gray-700 transition-colors">
							<div className="flex items-center gap-2 mb-4">
								<svg
									className="w-4 h-4 text-gray-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
								<span className="text-gray-400 text-sm">
									Calendar Integration
								</span>
							</div>
							<h3 className="text-2xl font-bold mb-3">
								Never miss a deadline.
							</h3>
							<p className="text-gray-400 mb-6 leading-relaxed">
								Schedule meetings, track milestones, and keep your entire team
								synchronized with integrated calendar views.
							</p>
							<div className="relative overflow-hidden">
								<Image
									src="/screenshots/events.png"
									alt="Calendar and events interface"
									width={800}
									height={600}
									className="w-full h-auto"
								/>
							</div>
						</div>

						{/* Search & Organization Card */}
						<div className="relative border border-gray-800 p-8 bg-gray-950 hover:border-gray-700 transition-colors">
							<div className="flex items-center gap-2 mb-4">
								<svg
									className="w-4 h-4 text-gray-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
								<span className="text-gray-400 text-sm">Smart Search</span>
							</div>
							<h3 className="text-2xl font-bold mb-3">
								Find anything, instantly.
							</h3>
							<p className="text-gray-400 mb-6 leading-relaxed">
								Full-text search across all your projects, tasks, and documents.
								Filter by type, status, or team member with lightning speed.
							</p>
							<div className="relative overflow-hidden">
								<Image
									src="/screenshots/search.png"
									alt="Search interface"
									width={800}
									height={600}
									className="w-full h-auto"
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Technical Section */}
			<section className="relative overflow-hidden">
				<div className="mx-auto max-w-7xl relative border border-gray-200 dark:border-gray-800 p-6 py-16">
					<div className="absolute -top-3 -left-3 w-6 h-6 flex items-center justify-center text-primary text-xl font-light">
						+
					</div>
					<div className="absolute -bottom-3 -right-3 w-6 h-6 flex items-center justify-center text-primary text-xl font-light">
						+
					</div>
					<div className="grid lg:grid-cols-2 gap-20 items-center">
						<div>
							<h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] mb-8 leading-tight">
								Transparent, audited, &<br />
								<span className="text-green-400 relative">
									open source
									<div className="absolute -bottom-1 left-0 right-0 h-2 bg-green-400/30 -skew-x-12" />
								</span>
							</h2>
							<p className="text-xl text-gray-300 mb-10 leading-relaxed">
								Built by developers, for developers. Self-host on your
								infrastructure, customize to your needs, and contribute to a
								growing community. No vendor lock-in, no hidden costs.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 mb-8">
								<Link
									href="https://railway.com/deploy/manage"
									className="inline-flex items-center gap-3 px-6 py-3 rounded-full font-semibold bg-green-600 text-white shadow-sm shadow-green-600/25 border-b-4 border-green-700 hover:bg-green-500 hover:border-green-600 active:border-green-600 active:shadow-sm active:translate-y-0.5 transition-all duration-150"
								>
									<svg
										className="w-5 h-5"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M.113 10.27A.691.691 0 0 1 0 9.92c0-.12.034-.24.113-.35A9.9 9.9 0 0 1 3.537 6.07a9.95 9.95 0 0 1 5.18-2.012 10.1 10.1 0 0 1 5.516.927c.41.193.59.713.404 1.16s-.626.644-1.036.45a8.2 8.2 0 0 0-4.482-.753 8.08 8.08 0 0 0-4.207 1.635 8.05 8.05 0 0 0-2.78 3.568.82.82 0 0 1-.362.42.75.75 0 0 1-.542.084.75.75 0 0 1-.47-.281l.113.35zm22.14.12c.098.152.147.333.14.517a9.88 9.88 0 0 1-1.836 5.137 9.92 9.92 0 0 1-4.408 3.422 9.95 9.95 0 0 1-5.533.644 10.03 10.03 0 0 1-4.92-2.26c-.346-.29-.41-.835-.143-1.22s.722-.47 1.068-.18a8.12 8.12 0 0 0 3.995 1.836 8.08 8.08 0 0 0 4.495-.523 8.05 8.05 0 0 0 3.58-2.78 8.02 8.02 0 0 0 1.49-4.173.82.82 0 0 1 .227-.495.75.75 0 0 1 .492-.225.75.75 0 0 1 .509.172l-.156-.872zm-9.907-6.15c.17 0 .335.077.447.21l2.845 3.39c.187.223.182.565-.012.782l-2.546 2.843c-.193.216-.505.249-.735.077l-.083-.077-2.546-2.843c-.193-.216-.2-.558-.012-.782l2.845-3.39a.54.54 0 0 1 .362-.184l.085-.006.35-.02zm-.7 1.636l-1.794 2.138 1.795 2.003 1.795-2.003-1.795-2.138zm.35 8.93a.54.54 0 0 1 .447.21l2.845 3.39c.187.223.182.565-.012.782l-2.546 2.843c-.193.216-.505.249-.735.077l-.083-.077-2.546-2.843c-.193-.216-.2-.558-.012-.782l2.845-3.39a.54.54 0 0 1 .362-.184l.085-.006.35-.02zm-.7 1.636l-1.794 2.138 1.795 2.003 1.795-2.003-1.795-2.138z" />
									</svg>
									Deploy on Railway
								</Link>
								<Link
									href="https://github.com/techulus/manage"
									className="inline-flex items-center gap-3 px-6 py-3 rounded-full font-semibold border-2 border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
								>
									<svg
										className="w-5 h-5"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
											clipRule="evenodd"
										/>
									</svg>
									Star on GitHub <span>→</span>
								</Link>
							</div>
							<div className="grid grid-cols-2 gap-6 text-sm">
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-green-400" />
									<span className="text-gray-300">AGPL-3.0 Licensed</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-blue-400" />
									<span className="text-gray-300">Docker Ready</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-purple-400" />
									<span className="text-gray-300">TypeScript</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-yellow-400" />
									<span className="text-gray-300">Next.js</span>
								</div>
							</div>
						</div>
						<div className="bg-black text-white p-8 font-mono min-h-[400px] rounded-md border">
							<div className="flex items-center gap-2 mb-6">
								<div className="w-3 h-3 bg-red-500 rounded-lg" />
								<div className="w-3 h-3 bg-yellow-500 rounded-lg" />
								<div className="w-3 h-3 bg-green-500 rounded-lg" />
								<div className="ml-4 text-gray-300 text-xs">Terminal</div>
							</div>
							<div className="space-y-2 text-base">
								<div>
									<span className="text-green-400">$</span>{" "}
									<span className="text-blue-300">git</span>{" "}
									<span className="text-white">
										clone github.com/techulus/manage
									</span>
								</div>
								<div>
									<span className="text-green-400">$</span>{" "}
									<span className="text-blue-300">cd</span>{" "}
									<span className="text-white">manage</span>
								</div>
								<div>
									<span className="text-green-400">$</span>{" "}
									<span className="text-blue-300">bun</span>{" "}
									<span className="text-white">install</span>
								</div>
								<div>
									<span className="text-green-400">$</span>{" "}
									<span className="text-blue-300">bun</span>{" "}
									<span className="text-white">dev</span>
								</div>
								<div className="py-3" />
								<div className="text-gray-300"># Start building locally</div>
								<div className="text-green-400">
									▸{" "}
									<span className="text-white">
										Ready on http://localhost:3000
									</span>
								</div>
								<div className="text-gray-300"># Happy coding! 🚀</div>
							</div>

							{/* Animated cursor */}
							<div className="mt-4 flex items-center">
								<span className="text-green-400">$</span>
								<span className="ml-2 w-2 h-4 bg-green-400 animate-pulse" />
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="max-w-7xl mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
					{[
						{
							icon: "📋",
							name: "Task Management",
							desc: "Create and organize tasks. Track progress with lists, priorities, and team assignments for efficient project delivery.",
						},
						{
							icon: "📅",
							name: "Calendar & Events",
							desc: "Schedule meetings and deadlines. Keep your team synchronized with integrated calendar management.",
						},
						{
							icon: "👥",
							name: "Team Collaboration",
							desc: "Real-time activity feeds. Stay connected with instant notifications and seamless communication.",
						},
						{
							icon: "🔍",
							name: "Advanced Search",
							desc: "Find anything instantly. Full-text search across all projects with powerful filtering options.",
						},
						{
							icon: "🏢",
							name: "Organization & Users",
							desc: "Manage teams and organizations. Invite members, assign roles, and organize your workspace efficiently.",
						},
						{
							icon: "🔐",
							name: "Permissions & Security",
							desc: "Fine-grained access control. Set project permissions, manage user roles, and keep your data secure.",
						},
					].map((feature, _index) => (
						<div key={feature.name} className="p-8 border">
							<div className="flex items-center gap-3 mb-3">
								<span className="text-primary">{feature.icon}</span>
								<h3 className="font-semibold text-gray-900 dark:text-white">
									{feature.name}
								</h3>
							</div>
							<p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
								{feature.desc}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* CTA Section */}
			<section className="text-center relative overflow-hidden">
				{/* Background Elements */}
				<div className="absolute inset-0 opacity-30 dark:opacity-15">
					<div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-green-300/30 dark:from-green-900/30 to-transparent blur-3xl" />
					<div className="absolute bottom-10 right-10 w-72 h-72 bg-gradient-to-tl from-blue-300/30 dark:from-blue-900/30 to-transparent blur-3xl" />
					<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-200/20 dark:from-purple-900/20 to-transparent blur-3xl" />
				</div>

				<div className="mx-auto max-w-7xl relative border border-gray-200 dark:border-gray-800 p-16 z-10">
					<div className="absolute -bottom-3 -left-3 w-6 h-6 flex items-center justify-center text-primary text-xl font-light">
						+
					</div>
					<div className="absolute -bottom-3 -right-3 w-6 h-6 flex items-center justify-center text-primary text-xl font-light">
						+
					</div>
					<h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-gray-900 dark:text-white mb-6 leading-tight px-6">
						Ready to transform your{" "}
						<span className="text-green-600 dark:text-green-400 relative">
							workflow
							<div className="absolute bottom-1 left-0 right-0 h-8 bg-green-200/30 dark:bg-green-400/30 -skew-x-12" />
						</span>
						?
					</h2>

					{!signupsDisabled && (
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
							<Link
								href="/start"
								className="inline-block bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-sm shadow-green-600/25 border-b-4 border-green-700 hover:bg-green-500 hover:border-green-600 active:border-green-600 active:shadow-sm active:translate-y-0.5 transition-all duration-150 dark:bg-green-600 dark:border-green-700 dark:hover:bg-green-500 dark:hover:border-green-600"
							>
								Get started →
							</Link>
						</div>
					)}
				</div>
			</section>

			<Footer />
		</div>
	);
}
