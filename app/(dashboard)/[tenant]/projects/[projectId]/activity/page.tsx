import { MarkdownView } from "@/components/core/markdown-view";
import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { activity } from "@/drizzle/schema";
import type { ActivityWithActor } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import { database } from "@/lib/utils/useDatabase";
import { desc, eq } from "drizzle-orm";
import { PencilIcon, PlusCircleIcon, TrashIcon } from "lucide-react";

type Props = {
	params: {
		projectId: string;
	};
};

async function ActivityItem({
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
							{item.actor?.imageUrl ? (
								<Avatar className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white dark:bg-black dark:ring-black">
									<AvatarImage src={item.actor.imageUrl} />
									<AvatarFallback>
										{item.actor?.firstName ?? "User"}
									</AvatarFallback>
								</Avatar>
							) : null}

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
								<p className="mt-0.5 text-sm text-gray-500">
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

export default async function ActivityDetails({ params }: Props) {
	const { projectId } = params;

	const db = await database();
	const activities = await db.query.activity
		.findMany({
			with: {
				actor: {
					columns: {
						id: true,
						firstName: true,
						imageUrl: true,
					},
				},
			},
			where: eq(activity.projectId, +projectId),
			orderBy: [desc(activity.createdAt)],
			limit: 50,
		})
		.execute();

	// TODO: Add pagination

	return (
		<>
			<PageTitle title="Activity" />

			<PageSection topInset>
				<div className="flex w-full rounded-lg bg-white dark:bg-black">
					{activities.length ? (
						<ul className="w-full px-6 py-4 md:p-6">
							{activities.map((activityItem, activityItemIdx) => {
								return (
									// @ts-ignore
									<ActivityItem
										key={activityItem.id}
										item={activityItem}
										isLast={activityItemIdx === activities.length - 1}
									/>
								);
							})}
						</ul>
					) : (
						<p className="p-12 text-center text-sm">No activity found</p>
					)}
				</div>
			</PageSection>
		</>
	);
}
