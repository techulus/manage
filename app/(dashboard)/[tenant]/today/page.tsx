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

	return (
		<>
			<PageTitle title="Today" />

			<PageSection topInset>
				<h1 className="p-8">Hello</h1>
			</PageSection>
		</>
	);
}
