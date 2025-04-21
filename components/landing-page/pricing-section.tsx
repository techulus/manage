import { CheckCircleIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";

export function PricingSection() {
	return (
		<div className="py-12">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto mt-16 max-w-2xl rounded-3xl sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
					<div className="p-8 sm:p-10 lg:flex-auto">
						<h3 className="text-4xl font-bold tracking-tighter">
							<span className="text-primary font-extrabold">Free</span> during
							public beta
						</h3>
						<div className="mt-10 flex items-center gap-x-4">
							<h4 className="flex-none text-lg font-semibold leading-6">
								What's included
							</h4>
							<div className="h-px flex-auto" />
						</div>
						<ul className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6">
							<li className="flex gap-x-3">
								<CheckCircleIcon
									className="h-6 w-5 flex-none text-primary"
									aria-hidden="true"
								/>
								All core features
							</li>
							<li className="flex gap-x-3">
								<CheckCircleIcon
									className="h-6 w-5 flex-none text-primary"
									aria-hidden="true"
								/>
								Unlimited projects, tasks and events
							</li>
							<li className="flex gap-x-3">
								<CheckCircleIcon
									className="h-6 w-5 flex-none text-primary"
									aria-hidden="true"
								/>
								Single organization workspace
							</li>
							<li className="flex gap-x-3">
								<CheckCircleIcon
									className="h-6 w-5 flex-none text-primary"
									aria-hidden="true"
								/>
								Suggest features and influence roadmap
							</li>
						</ul>
					</div>
					<div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
						<div className="rounded-2xl py-10 text-center lg:flex lg:flex-col lg:justify-center lg:py-16 border">
							<div className="mx-auto max-w-xs px-8">
								<p className="text-base font-semibold">Pricing</p>
								<p className="mt-6 flex items-baseline justify-center gap-x-2">
									<span className="text-5xl font-bold tracking-tight text-primary">
										$0
									</span>
									<span className="text-sm font-semibold leading-6 tracking-wide">
										during beta
									</span>
								</p>
								<p className="mt-6 text-sm leading-5">
									Future pricing will include monthly and annual subscription
									options
								</p>
								<div className="mt-10">
									<Link href="/start" className={buttonVariants()}>
										Get started for free
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
