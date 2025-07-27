import {
	Cloud,
	CloudLightning,
	DollarSign,
	HeartIcon,
	HelpCircle,
	RouterIcon,
	ShieldQuestion,
	TerminalIcon,
} from "lucide-react";

export function FeaturesSection() {
	const features = [
		{
			title: "Open Source & Transparent",
			description:
				"Fully open-source codebase with complete transparency. Customize, extend, and contribute to the platform.",
			icon: <TerminalIcon />,
		},
		{
			title: "Intuitive Interface",
			description:
				"Clean, modern design that gets out of your way. Manage tasks, events, and files with minimal clicks.",
			icon: <ShieldQuestion />,
		},
		{
			title: "Seamless File Sharing",
			description:
				"Upload, organize, and share files within your team. Keep all project resources in one centralized location.",
			icon: <Cloud />,
		},
		{
			title: "Simple Pricing",
			description:
				"Free to self-host forever. Affordable cloud hosting with no hidden fees or usage limits.",
			icon: <DollarSign />,
		},
		{
			title: "Team Management",
			description:
				"Multi-tenant architecture with role-based permissions. Scale from small teams to large organizations.",
			icon: <RouterIcon />,
		},
		{
			title: "Real-time Collaboration",
			description:
				"Live comments, instant notifications, and real-time updates keep your team in sync.",
			icon: <HelpCircle />,
		},
		{
			title: "Complete Visibility",
			description:
				"Comprehensive activity logs and progress tracking. Never lose sight of project momentum.",
			icon: <CloudLightning />,
		},
		{
			title: "Developer-First",
			description:
				"Built by developers, for developers. API-first design with webhook integrations and automation.",
			icon: <HeartIcon />,
		},
	];
	return (
		<section className="py-24 sm:py-32 bg-white dark:bg-neutral-800">
			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-20">
					<h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
						Everything you need in one place
					</h2>
					<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
						Powerful project management features that actually make your team
						more productive.
					</p>
				</div>
				<div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
					{features.map((feature) => (
						<Feature key={feature.title} {...feature} />
					))}
				</div>
			</div>
		</section>
	);
}

const Feature = ({
	title,
	description,
	icon,
}: {
	title: string;
	description: string;
	icon: React.ReactNode;
}) => {
	return (
		<div className="text-center">
			<div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mx-auto mb-6 dark:bg-green-900/20">
				<div className="w-8 h-8 text-green-600 dark:text-green-400">{icon}</div>
			</div>
			<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
				{title}
			</h3>
			<p className="text-gray-600 dark:text-gray-300 leading-7 text-lg">
				{description}
			</p>
		</div>
	);
};
