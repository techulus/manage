import { Greeting } from "@/components/core/greeting";
import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { task } from "@/drizzle/schema";
import { database } from "@/lib/utils/useDatabase";
import { and, lte, ne } from "drizzle-orm";

export default async function Today() {
	const db = await database();

	const tasks = await db.query.task.findMany({
		where: and(lte(task.dueDate, new Date()), ne(task.status, "done")),
	});

	console.log({ tasks });

	const summary = `You've got ${tasks.length} tasks due today.`;

	return (
		<>
			<PageTitle title="Today" />

			<PageSection topInset>
				<p className="p-4 text-xl">
					<Greeting />, {summary}
				</p>
			</PageSection>
		</>
	);
}
