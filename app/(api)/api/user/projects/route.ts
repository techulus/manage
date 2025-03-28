import { getProjectsForOwner } from "@/lib/utils/useProjects";
import { NextResponse } from "next/server";

export async function GET(_: Request) {
	try {
		const projects = await getProjectsForOwner({
			statuses: ["active"],
		});
		return NextResponse.json(projects);
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 500 },
		);
	}
}
