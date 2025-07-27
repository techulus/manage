import {
	CalendarIcon,
	FolderIcon,
	ListTodoIcon,
	SearchIcon,
	SettingsIcon,
	UsersIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export const dynamic = "force-static";
export const revalidate = 86400;

export default async function Home() {
	return (
		<div className="min-h-screen">
			<Header />

			{/* Hero Section */}
			<section className="px-4 pt-32 pb-32 text-center">
				<div className="mx-auto max-w-6xl">
					<div className="mb-6">
						<span className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full text-sm font-semibold text-green-700 dark:text-green-300">
							<span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
							Open Source Project Management
						</span>
					</div>
					<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.02em] text-gray-900 dark:text-white leading-[0.9]">
						Tired of complex project tools? <br />
						Meet{" "}
						<span className="text-green-600 dark:text-green-400">
							beautiful simplicity
						</span>
						.
					</h1>
					<p className="mt-8 text-xl sm:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
						Self-hostable, developer-friendly project management. All the power
						you need, none of the bloat you don't. Built with modern tech stack
						and open source values.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
						<Link
							href="/start"
							className="inline-block bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-sm shadow-green-600/25 border-b-4 border-green-700 hover:bg-green-500 hover:border-green-600 active:border-green-600 active:shadow-sm active:translate-y-0.5 transition-all duration-150 dark:bg-green-600 dark:border-green-700 dark:hover:bg-green-500 dark:hover:border-green-600"
						>
							Try Manage →
						</Link>
						<Link
							href="https://github.com/techulus/manage"
							className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold border-2 border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
						>
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
			</section>

			{/* Product Screenshots Section */}
			<section className="px-4 pb-32">
				<div className="mx-auto max-w-7xl">
					<div className="text-center mb-16">
						<h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-gray-900 dark:text-white mb-6">
							See Manage in action
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
							Real screenshots from the actual product. No mock-ups, no fake
							data.
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
						<div className="group">
							<div className="relative overflow-hidden rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02]">
								<Image
									src="/screenshots/overview.png"
									alt="Project overview dashboard showing tasks, progress, and team activity"
									width={800}
									height={600}
									className="w-full h-auto"
									priority
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							</div>
							<div className="mt-6 px-2">
								<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
									Project Dashboard
								</h3>
								<p className="text-gray-600 dark:text-gray-400">
									Get a complete overview of your projects, track progress, and
									manage team workload in one place.
								</p>
							</div>
						</div>

						<div className="group">
							<div className="relative overflow-hidden rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02]">
								<Image
									src="/screenshots/tasks.png"
									alt="Task management interface with lists, priorities, and team assignments"
									width={800}
									height={600}
									className="w-full h-auto"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							</div>
							<div className="mt-6 px-2">
								<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
									Task Management
								</h3>
								<p className="text-gray-600 dark:text-gray-400">
									Organize tasks with lists, set priorities, assign team
									members, and track progress with intuitive workflows.
								</p>
							</div>
						</div>
					</div>

					<div className="flex justify-center">
						<div className="group max-w-4xl">
							<div className="relative overflow-hidden rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02]">
								<Image
									src="/screenshots/events.png"
									alt="Calendar and events interface showing scheduled meetings and deadlines"
									width={1200}
									height={800}
									className="w-full h-auto"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							</div>
							<div className="mt-6 px-2 text-center">
								<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
									Calendar & Events
								</h3>
								<p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
									Schedule meetings, set deadlines, and keep your team
									synchronized with integrated calendar management.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="px-4 py-32 bg-gradient-to-br from-gray-50 via-white to-green-50/30 dark:from-gray-800 dark:via-gray-900 dark:to-green-900/10 relative overflow-hidden">
				{/* Background Pattern */}
				<div className="absolute inset-0 opacity-20 dark:opacity-10">
					<div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-200 dark:from-green-900 to-transparent rounded-full blur-3xl" />
					<div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-200 dark:from-blue-900 to-transparent rounded-full blur-3xl" />
				</div>

				<div className="mx-auto max-w-6xl text-center relative z-10">
					<h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-gray-900 dark:text-white mb-6 leading-tight">
						Essential tools that keep your team{" "}
						<span className="text-green-600 dark:text-green-400 relative">
							productive
							<div className="absolute -bottom-1 left-0 right-0 h-2 bg-green-200/50 dark:bg-green-400/30 -skew-x-12" />
						</span>
					</h2>
					<p className="text-xl text-gray-600 dark:text-gray-300 mb-20 max-w-3xl mx-auto leading-relaxed">
						Tasks, Events, Files, Docs, and more — beautifully designed and
						thoughtfully integrated for maximum efficiency.
					</p>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
						{[
							{
								icon: <ListTodoIcon className="w-8 h-8 text-white" />,
								name: "Task Management",
								desc: "Create, organize, and track tasks with powerful lists, priorities, and team assignments",
								features: [
									"Task lists & boards",
									"Priority levels",
									"Team assignments",
									"Progress tracking",
								],
								color: "from-green-400 to-green-600",
							},
							{
								icon: <CalendarIcon className="w-8 h-8 text-white" />,
								name: "Calendar & Events",
								desc: "Schedule meetings, set deadlines, and keep your team synchronized with integrated calendar",
								features: [
									"Event scheduling",
									"Deadline tracking",
									"Team sync",
									"Calendar integration",
								],
								color: "from-pink-400 to-pink-600",
							},
							{
								icon: <UsersIcon className="w-8 h-8 text-white" />,
								name: "Team Collaboration",
								desc: "Real-time activity feeds, notifications, and seamless team communication tools",
								features: [
									"Activity tracking",
									"Real-time updates",
									"Team notifications",
									"Collaboration tools",
								],
								color: "from-blue-400 to-blue-600",
							},
							{
								icon: <FolderIcon className="w-8 h-8 text-white" />,
								name: "File Management",
								desc: "Secure file storage, sharing, and organization with S3-compatible storage backend",
								features: [
									"File upload/sharing",
									"Secure storage",
									"Version control",
									"Team access",
								],
								color: "from-purple-400 to-purple-600",
							},
							{
								icon: <SearchIcon className="w-8 h-8 text-white" />,
								name: "Advanced Search",
								desc: "Full-text search across projects, tasks, and content with advanced filtering options",
								features: [
									"Full-text search",
									"Advanced filters",
									"Project-based search",
									"Quick navigation",
								],
								color: "from-orange-400 to-orange-600",
							},
							{
								icon: <SettingsIcon className="w-8 h-8 text-white" />,
								name: "Self-Hosted",
								desc: "Deploy on your infrastructure with Docker, customize to your needs, full control",
								features: [
									"Docker deployment",
									"Self-hosting",
									"Full customization",
									"No vendor lock-in",
								],
								color: "from-slate-500 to-slate-700",
							},
						].map((feature) => (
							<div
								key={feature.name}
								className="bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300 group"
							>
								<div className="flex items-center gap-4 mb-6">
									<div
										className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
									>
										{feature.icon}
									</div>
									<h3 className="font-bold tracking-[-0.01em] text-gray-900 dark:text-white text-xl">
										{feature.name}
									</h3>
								</div>
								<p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
									{feature.desc}
								</p>
								<ul className="space-y-2">
									{feature.features.map((item) => (
										<li
											key={item}
											className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
										>
											<div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
											{item}
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Technical Section */}
			<section className="px-4 py-32 bg-gradient-to-r relative overflow-hidden">
				<div className="mx-auto max-w-7xl relative z-10">
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
									href="https://github.com/techulus/manage"
									className="inline-flex items-center gap-3 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-sm shadow-green-600/25 border-b-4 border-green-700 hover:bg-green-500 hover:border-green-600 active:border-green-600 active:shadow-sm active:translate-y-0.5 transition-all duration-150"
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
									<div className="w-2 h-2 bg-green-400 rounded-full" />
									<span className="text-gray-300">AGPL-3.0 Licensed</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-blue-400 rounded-full" />
									<span className="text-gray-300">Docker Ready</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-purple-400 rounded-full" />
									<span className="text-gray-300">TypeScript</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-yellow-400 rounded-full" />
									<span className="text-gray-300">Next.js 15</span>
								</div>
							</div>
						</div>
						<div className="bg-black text-white rounded-2xl p-8 font-mono border border-neutral-600 shadow-2xl min-h-[400px]">
							<div className="flex items-center gap-2 mb-6">
								<div className="w-3 h-3 bg-red-500 rounded-full shadow-sm" />
								<div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm" />
								<div className="w-3 h-3 bg-green-500 rounded-full shadow-sm" />
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

			{/* CTA Section */}
			<section className="px-4 py-32 text-center relative overflow-hidden">
				{/* Background Elements */}
				<div className="absolute inset-0 opacity-30 dark:opacity-15">
					<div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-green-300/30 dark:from-green-900/30 to-transparent rounded-full blur-3xl" />
					<div className="absolute bottom-10 right-10 w-72 h-72 bg-gradient-to-tl from-blue-300/30 dark:from-blue-900/30 to-transparent rounded-full blur-3xl" />
					<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-200/20 dark:from-purple-900/20 to-transparent rounded-full blur-3xl" />
				</div>

				<div className="mx-auto max-w-4xl relative z-10">
					<h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-gray-900 dark:text-white mb-6 leading-tight">
						Ready to transform your{" "}
						<span className="text-green-600 dark:text-green-400 relative">
							workflow
							<div className="absolute -bottom-1 left-0 right-0 h-2 bg-green-300/40 dark:bg-green-400/30 -skew-x-12" />
						</span>
						?
					</h2>

					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<Link
							href="/start"
							className="inline-block bg-green-600 text-white px-6 py-3 rounded-2xl text-lg font-semibold shadow-xl shadow-green-600/25 border-b-4 border-green-700 hover:bg-green-500 hover:border-green-600 active:border-green-600 active:shadow-sm active:translate-y-0.5 transition-all duration-150 dark:bg-green-600 dark:border-green-700 dark:hover:bg-green-500 dark:hover:border-green-600 dark:shadow-green-600/20"
						>
							Get started →
						</Link>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}
