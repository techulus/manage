"use server";

import fs from "node:fs";
import { auth } from "@/lib/betterauth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function deleteWorkspace(formData: FormData) {
	const id = String(formData.get("id"));

	console.log("Deleting workspace", id);
	await auth.api.deleteOrganization({
		headers: await headers(),
		body: {
			organizationId: id,
		},
	});

	console.log("Deleting workspace database", id);
	fs.unlinkSync(`sqlite/${id}.db`);

	redirect("/start");
}
