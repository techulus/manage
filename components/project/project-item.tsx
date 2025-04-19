import type { ProjectWithCreator } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import { toDateStringWithDay } from "@/lib/utils/date";
import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { HtmlPreview } from "../core/html-view";
import { UserAvatar } from "../core/user-avatar";

export const ProjecItem = ({
	project: { id, name, description, creator, dueDate },
	timezone,
}: {
	project: ProjectWithCreator;
	timezone: string;
}) => {
	return (
		<div
			key={id}
			className={cn(
				"relative flex h-[120px] justify-between rounded-lg bg-muted px-3 py-2 shadow-sm hover:border-foreground/20 space-y-1",
			)}
		>
			<div>
				<h3 className="text-xl font-semibold">
					<Link href={`./projects/${id}`} className="focus:outline-none">
						<span className="absolute inset-0" aria-hidden="true" />
						{name}
					</Link>
				</h3>
				{description ? (
					<div className="line-clamp-3">
						<HtmlPreview content={description} />
					</div>
				) : null}
				{dueDate ? (
					<div className="text-muted-foreground text-sm">
						<CalendarClock className="w-4 h-4 inline-block text-primary -mt-1 mr-1" />
						Due {toDateStringWithDay(dueDate, timezone)}
					</div>
				) : null}
			</div>
			<span
				className="pointer-events-none text-muted-foreground group-hover:text-foreground"
				aria-hidden="true"
			>
				<UserAvatar user={creator} />
			</span>
		</div>
	);
};
