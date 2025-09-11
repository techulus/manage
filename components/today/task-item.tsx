import Link from "next/link";

export function TaskItem({
	task,
	tenant,
}: {
	tenant: string;
	task: {
		name: string;
		id: number;
		taskList: {
			id: number;
			name: string;
			status: string;
			project: { id: number; name: string };
		};
	};
}) {
	return (
		<Link
			href={`/${tenant}/projects/${task.taskList.project.id}/tasklists/${task.taskList.id}`}
		>
			<div className="px-4 py-2 hover:bg-muted/50 transition-colors border-none">
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<h4 className="font-medium">{task.name}</h4>
						<div className="text-sm text-muted-foreground">
							<span className="text-primary">{task.taskList.project.name}</span>{" "}
							• {task.taskList.name}
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}
