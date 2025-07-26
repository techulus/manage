import {
	CalendarIcon,
	FolderIcon,
	ListTodoIcon,
	UsersIcon,
} from "lucide-react";
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
					<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.02em] text-gray-900 dark:text-white leading-[0.9]">
						The{" "}
						<span className="text-green-600 dark:text-green-400">
							project management
						</span>
						<br />
						tool your team will actually{" "}
						<span className="text-green-600 dark:text-green-400">love</span>.
					</h1>
					<p className="mt-8 text-xl sm:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
						Beautiful project management, intuitive task tracking, and seamless
						collaboration tools that empower your team to ship exceptional
						software.
					</p>
					<Link
						href="/start"
						className="inline-block mt-12 bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-sm shadow-green-600/25 border-b-4 border-green-700 hover:bg-green-500 hover:border-green-600 active:border-green-600 active:shadow-sm active:translate-y-0.5 transition-all duration-150 dark:bg-green-600 dark:border-green-700 dark:hover:bg-green-500 dark:hover:border-green-600"
					>
						Start for free →
					</Link>
				</div>
			</section>

			{/* Screenshot Section */}
			<section className="px-4 pb-32">
				<div className="mx-auto max-w-7xl">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 p-8 dark:bg-gray-800/90 border border-white/20 dark:border-gray-700/50 hover:shadow-2xl dark:hover:shadow-gray-700/50 transition-all duration-300 group">
							<div className="flex items-center gap-3 mb-6">
								<div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-sm shadow-green-200/50 group-hover:shadow-green-300/60 transition-shadow">
									<ListTodoIcon className="w-6 h-6 text-white" />
								</div>
								<span className="text-base font-bold tracking-[-0.01em] text-green-600 dark:text-green-400">
									Tasks
								</span>
							</div>
							<div className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium uppercase tracking-wide">
								Frontend Team
							</div>
							<div className="space-y-4">
								<div className="flex items-center gap-4 p-3 bg-green-50/50 dark:bg-green-900/20 rounded-xl">
									<div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-sm" />
									<span className="text-gray-700 dark:text-gray-300 font-semibold">
										Update components
									</span>
								</div>
								<div className="flex items-center gap-4 p-3 bg-yellow-50/50 dark:bg-yellow-900/20 rounded-xl">
									<div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-sm" />
									<span className="text-gray-700 dark:text-gray-300 font-semibold">
										Review PR #42
									</span>
								</div>
								<div className="flex items-center gap-4 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl">
									<div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-sm" />
									<span className="text-gray-700 dark:text-gray-300 font-semibold">
										Ship v2.1
									</span>
								</div>
							</div>
						</div>

						<div className="backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 p-8 dark:bg-gray-800/90 border border-white/20 dark:border-gray-700/50 hover:shadow-2xl dark:hover:shadow-gray-700/50 transition-all duration-300 group">
							<div className="flex items-center gap-3 mb-6">
								<div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-sm shadow-pink-200/50 group-hover:shadow-pink-300/60 transition-shadow">
									<CalendarIcon className="w-6 h-6 text-white" />
								</div>
								<span className="text-base font-bold tracking-[-0.01em] text-pink-600 dark:text-pink-400">
									Calendar
								</span>
							</div>
							<div className="space-y-6">
								<div className="text-2xl font-bold tracking-[-0.02em] text-gray-900 dark:text-gray-100">
									Thu, Apr 17
								</div>
								<div className="space-y-3">
									<div className="bg-gradient-to-r from-pink-50 to-pink-100/50 dark:from-pink-900/20 dark:to-pink-800/20 px-4 py-3 rounded-xl text-sm font-semibold shadow-sm border border-pink-200/30 dark:border-pink-700/30">
										Sprint Planning • 9:00 AM
									</div>
									<div className="bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 px-4 py-3 rounded-xl text-sm font-semibold shadow-sm border border-purple-200/30 dark:border-purple-700/30">
										Design Review • 2:00 PM
									</div>
									<div className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 px-4 py-3 rounded-xl text-sm font-semibold shadow-sm border border-blue-200/30 dark:border-blue-700/30">
										Team Sync • 4:30 PM
									</div>
								</div>
							</div>
						</div>

						<div className="backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 p-8 dark:bg-gray-800/90 border border-white/20 dark:border-gray-700/50 hover:shadow-2xl dark:hover:shadow-gray-700/50 transition-all duration-300 group">
							<div className="flex items-center gap-3 mb-6">
								<div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-sm shadow-blue-200/50 group-hover:shadow-blue-300/60 transition-shadow">
									<FolderIcon className="w-6 h-6 text-white" />
								</div>
								<span className="text-base font-bold tracking-[-0.01em] text-blue-600 dark:text-blue-400">
									Files
								</span>
							</div>
							<div className="space-y-6">
								<div className="text-sm text-gray-600 dark:text-gray-400 font-bold uppercase tracking-tight">
									Design Assets
								</div>
								<div className="space-y-3">
									<div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
										<div className="flex items-center gap-3">
											<div className="w-3 h-3 bg-green-500 rounded-full" />
											<span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
												mockups.fig
											</span>
										</div>
										<span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
											2.4 MB
										</span>
									</div>
									<div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
										<div className="flex items-center gap-3">
											<div className="w-3 h-3 bg-blue-500 rounded-full" />
											<span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
												wireframes.sketch
											</span>
										</div>
										<span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
											1.8 MB
										</span>
									</div>
								</div>
								<button
									type="button"
									className="w-full bg-green-600 text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-sm shadow-green-600/25 border-b-4 border-green-700 hover:bg-green-500 hover:border-green-600 active:border-green-600 active:shadow-sm active:translate-y-0.5 transition-all duration-150 dark:bg-green-600 dark:border-green-700 dark:hover:bg-green-500 dark:hover:border-green-600"
								>
									Share Files
								</button>
							</div>
						</div>
					</div>

					<div className="mt-12 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 p-8 dark:bg-gray-800/90 border border-white/20 dark:border-gray-700/50 hover:shadow-2xl dark:hover:shadow-gray-700/50 transition-all duration-300">
						<div className="flex items-center gap-3 mb-8">
							<div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-sm shadow-purple-200/50 dark:shadow-purple-800/50">
								<UsersIcon className="w-6 h-6 text-white" />
							</div>
							<span className="text-lg font-bold tracking-[-0.01em] text-purple-600 dark:text-purple-400">
								Recent Activity
							</span>
						</div>
						<div className="space-y-6">
							<div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-900/20 dark:to-transparent rounded-xl border border-green-200/30 dark:border-green-700/30">
								<div className="flex items-center gap-4">
									<div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-sm shadow-green-200/50">
										<span className="text-sm font-bold text-white">AJ</span>
									</div>
									<div>
										<div className="text-base font-bold text-gray-900 dark:text-gray-100">
											Arjun Komath
										</div>
										<div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
											Completed "API Integration" task
										</div>
									</div>
								</div>
								<div className="text-xs text-gray-500 font-bold bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
									2 min ago
								</div>
							</div>
							<div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50/50 to-transparent dark:from-pink-900/20 dark:to-transparent rounded-xl border border-pink-200/30 dark:border-pink-700/30">
								<div className="flex items-center gap-4">
									<div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-sm shadow-pink-200/50">
										<span className="text-sm font-bold text-white">SJ</span>
									</div>
									<div>
										<div className="text-base font-bold text-gray-900 dark:text-gray-100">
											Sarah Johnson
										</div>
										<div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
											Updated mockups for dashboard redesign
										</div>
									</div>
								</div>
								<div className="text-xs text-gray-500 font-bold bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
									1 hour ago
								</div>
							</div>
							<div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/20 dark:to-transparent rounded-xl border border-blue-200/30 dark:border-blue-700/30">
								<div className="flex items-center gap-4">
									<div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-sm shadow-blue-200/50">
										<span className="text-sm font-bold text-white">MR</span>
									</div>
									<div>
										<div className="text-base font-bold text-gray-900 dark:text-gray-100">
											Mike Rodriguez
										</div>
										<div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
											Deployed version 2.0 to production
										</div>
									</div>
								</div>
								<div className="text-xs text-gray-500 font-bold bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
									3 hours ago
								</div>
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
							<div className="absolute -bottom-2 left-0 right-0 h-2 bg-green-200/50 dark:bg-green-400/30 -skew-x-12" />
						</span>
					</h2>
					<p className="text-xl text-gray-600 dark:text-gray-300 mb-20 max-w-3xl mx-auto leading-relaxed">
						Tasks, Events, Files, Docs, and more — beautifully designed and
						thoughtfully integrated for maximum efficiency.
					</p>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
						{[
							{
								icon: "✓",
								name: "Tasks",
								desc: "Powerful task management",
								color: "from-green-400 to-green-600",
							},
							{
								icon: "📅",
								name: "Events",
								desc: "Smart scheduling",
								color: "from-pink-400 to-pink-600",
							},
							{
								icon: "📄",
								name: "Docs",
								desc: "Document collaboration",
								color: "from-blue-400 to-blue-600",
							},
							{
								icon: "📁",
								name: "Files",
								desc: "Secure file storage",
								color: "from-purple-400 to-purple-600",
							},
						].map((feature) => (
							<div
								key={feature.name}
								className="text-center group cursor-pointer"
							>
								<div
									className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl shadow-sm shadow-gray-200 dark:shadow-gray-800/50 flex items-center justify-center text-3xl mb-6 mx-auto group-hover:shadow-xl group-hover:dark:shadow-gray-700/50 transition-all duration-300`}
								>
									{feature.icon}
								</div>
								<h3 className="font-bold tracking-[-0.01em] text-gray-900 dark:text-white mb-2 text-base">
									{feature.name}
								</h3>
								<p className="text-gray-600 dark:text-gray-400 leading-relaxed">
									{feature.desc}
								</p>
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
									<div className="absolute -bottom-2 left-0 right-0 h-2 bg-green-400/30 -skew-x-12" />
								</span>
							</h2>
							<p className="text-xl text-gray-300 mb-10 leading-relaxed">
								Manage is built with transparency at its core. Our entire
								codebase is open source, audited by the community, and designed
								with developer happiness in mind.
							</p>
							<div className="flex flex-col sm:flex-row gap-4">
								<Link
									href="https://github.com/techulus/manage"
									className="inline-flex items-center gap-3 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-sm shadow-green-600/25 border-b-4 border-green-700 hover:bg-green-500 hover:border-green-600 active:border-green-600 active:shadow-sm active:translate-y-0.5 transition-all duration-150"
								>
									View on GitHub <span>→</span>
								</Link>
							</div>
						</div>
						<div className="bg-black text-white rounded-2xl p-8 font-mono border border-gray-600 shadow-2xl min-h-[400px]">
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
							<div className="absolute -bottom-2 left-0 right-0 h-2 bg-green-300/40 dark:bg-green-400/30 -skew-x-12" />
						</span>
						?
					</h2>

					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<Link
							href="/start"
							className="inline-block bg-green-600 text-white px-6 py-3 rounded-2xl text-lg font-semibold shadow-xl shadow-green-600/25 border-b-4 border-green-700 hover:bg-green-500 hover:border-green-600 active:border-green-600 active:shadow-sm active:translate-y-0.5 transition-all duration-150 dark:bg-green-600 dark:border-green-700 dark:hover:bg-green-500 dark:hover:border-green-600 dark:shadow-green-600/20"
						>
							Start building for free →
						</Link>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}
