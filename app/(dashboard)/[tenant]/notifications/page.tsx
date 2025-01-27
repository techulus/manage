import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { getUserNotifications } from "../settings/actions";

function Dot({ className }: { className?: string }) {
	return (
		<svg
			width="6"
			height="6"
			fill="currentColor"
			viewBox="0 0 6 6"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden="true"
		>
			<circle cx="3" cy="3" r="3" />
		</svg>
	);
}

export default async function Notifications() {
	const notifications = await getUserNotifications();

	return (
		<>
			<PageTitle title="Notifications" />

			<PageSection topInset>
				{!notifications.length ? (
					<div className="text-center text-muted-foreground p-6 text-sm">
						No notifications
					</div>
				) : null}

				{notifications.map((notification) => (
					<div
						key={notification.id}
						className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
					>
						<div className="relative flex items-start gap-3 pe-3">
							{/* <img
                className="size-9 rounded-md"
                src={notification.image}
                width={32}
                height={32}
                alt={notification.user}
              /> */}
							<div className="flex-1 space-y-1">
								<button
									type="button"
									className="text-left text-foreground/80 after:absolute after:inset-0"
								>
									<span className="font-medium text-foreground hover:underline">
										{notification.user.firstName}
									</span>{" "}
									{notification.target}{" "}
									<span className="font-medium text-foreground hover:underline">
										{notification.target}
									</span>
									.
								</button>
								<div className="text-xs text-muted-foreground">
									{notification.createdAt.toLocaleDateString()}
								</div>
							</div>
							{!notification.read ? (
								<div className="absolute end-0 self-center">
									<Dot />
								</div>
							) : null}
						</div>
					</div>
				))}
			</PageSection>
		</>
	);
}
