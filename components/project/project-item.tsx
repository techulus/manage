import { CalendarClock } from "lucide-react";
import Link from "next/link";
import type { ProjectWithCreator } from "@/drizzle/types";
import { toDateStringWithDay } from "@/lib/utils/date";
import { HtmlPreview } from "../core/html-view";
import { UserAvatar } from "../core/user-avatar";

export const ProjecItem = ({
	project: { id, name, description, creator, dueDate },
	userRole,
	timezone,
}: {
	project: ProjectWithCreator;
	userRole?: string;
	timezone: string;
}) => {
	return (
		<Link
			href={`./projects/${id}`}
			className="block p-3 rounded-lg bg-muted hover:bg-primary/20"
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex-1 min-w-0 space-y-1">
					<h3 className="font-semibold text-lg tracking-tight truncate">
						{name}
					</h3>
					{userRole && (
						<span className="text-primary capitalize">{userRole}</span>
					)}

					{description && (
						<div className="text-sm text-muted-foreground line-clamp-2">
							<HtmlPreview content={description} />
						</div>
					)}

					{dueDate && (
						<div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
							<CalendarClock className="w-3 h-3" />
							<span>{toDateStringWithDay(dueDate, timezone)}</span>
						</div>
					)}
				</div>

				<UserAvatar user={creator} className="w-8 h-8" />
			</div>
		</Link>
	);
};
