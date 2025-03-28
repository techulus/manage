import type { ProjectWithCreator } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import { toDateStringWithDay } from "@/lib/utils/date";
import { convertMarkdownToPlainText } from "@/lib/utils/useMarkdown";
import Link from "next/link";
import { UserAvatar } from "../core/user-avatar";
import { Badge } from "../ui/badge";

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
				"relative flex h-[120px] justify-between space-x-3 rounded-lg border bg-card px-3 py-2 shadow-sm hover:border-foreground/20",
			)}
		>
			<div>
				<h3 className="text-2xl tracking-tight">
					<Link
						href={`./projects/${id}`}
						className="focus:outline-none"
						prefetch={false}
					>
						<span className="absolute inset-0" aria-hidden="true" />
						{name}
					</Link>
				</h3>
				<p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
					{convertMarkdownToPlainText(description)}
				</p>
				{dueDate ? (
					<Badge className="mt-2" variant="outline">
						Due {toDateStringWithDay(dueDate, timezone)}
					</Badge>
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
