"use client";

import { fetchActivities } from "@/app/(dashboard)/[tenant]/projects/actions";
import { Spinner } from "@/components/core/loaders";
import { MarkdownView } from "@/components/core/markdown-view";
import { UserAvatar } from "@/components/core/user-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ActivityWithActor } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import { PencilIcon, PlusCircleIcon, TrashIcon } from "lucide-react";
import { useCallback, useState } from "react";

export function ActivityItem({
	item,
	isLast,
}: { item: ActivityWithActor; isLast: boolean }) {
	return (
		<li key={item.id}>
			<div className={cn("relative pb-8", isLast ? "pb-2" : "")}>
				{!isLast ? (
					<span
						className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-800"
						aria-hidden="true"
					/>
				) : null}
				<div className="relative flex items-start space-x-3">
					<>
						<div className="relative">
							{item.actor ? <UserAvatar user={item.actor} /> : null}

							<span className="absolute -bottom-0.5 -right-1 rounded-tl-md bg-white px-0.5 py-px dark:bg-black">
								{item.action === "created" ? (
									<PlusCircleIcon
										className="h-5 w-5 text-gray-400"
										aria-hidden="true"
									/>
								) : null}
								{item.action === "updated" ? (
									<PencilIcon
										className="h-5 w-5 text-gray-400"
										aria-hidden="true"
									/>
								) : null}
								{item.action === "deleted" ? (
									<TrashIcon
										className="h-5 w-5 text-gray-400"
										aria-hidden="true"
									/>
								) : null}
							</span>
						</div>
						<div className="min-w-0 flex-1">
							<div className="text-sm text-primary">
								<a href={item.actor.id} className="font-medium">
									{item.actor.firstName}
								</a>
							</div>
							<div className="flex w-full flex-col md:flex-row md:justify-between">
								<div className="max-w-xl">
									{item.message ? (
										<MarkdownView content={item.message} />
									) : null}
								</div>
								<p
									className="mt-0.5 text-sm text-gray-500"
									suppressHydrationWarning
								>
									{item.createdAt.toLocaleTimeString()},{" "}
									{item.createdAt.toDateString()}
								</p>
							</div>
						</div>
					</>
				</div>
			</div>
		</li>
	);
}

export function ActivityFeed({
	activities,
	projectId,
}: { activities: ActivityWithActor[]; projectId: string }) {
	const [hasMore, setHasMore] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [initialActivities, setInitialActivities] =
		useState<ActivityWithActor[]>(activities);

	const loadMore = useCallback(async () => {
		setIsLoading(true);
		const activities = await fetchActivities(
			projectId,
			initialActivities.length,
		);
		console.log("Found activities: ", activities.length);
		setInitialActivities([...initialActivities, ...activities]);
		setHasMore(activities.length === 50);
		setIsLoading(false);
	}, [projectId, initialActivities]);

	return (
		<div className="flex flex-col w-full rounded-lg bg-white dark:bg-black">
			{activities.length ? (
				<>
					<ul className="w-full px-6 py-4 md:p-6">
						{initialActivities.map((activityItem, activityItemIdx) => (
							<ActivityItem
								key={activityItem.id}
								item={activityItem}
								isLast={activityItemIdx === initialActivities.length - 1}
							/>
						))}
					</ul>
					<div className="flex p-4">
						{hasMore && !isLoading ? (
							<Button onClick={loadMore}>View more</Button>
						) : null}
						{isLoading ? <Spinner /> : null}
					</div>
				</>
			) : (
				<p className="p-12 text-center text-sm">No activity found</p>
			)}
		</div>
	);
}
