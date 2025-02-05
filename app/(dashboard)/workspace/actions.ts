"use server";

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { auth } from "@/lib/betterauth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function deleteWorkspace(formData: FormData) {
	const id = String(formData.get("id"));

	console.log("Deleting workspace", id);
	await auth().api.deleteOrganization({
		headers: await headers(),
		body: {
			organizationId: id,
		},
	});

	console.log("Deleting workspace database", id);
	fs.unlinkSync(`sqlite/${id}.db`);

	redirect("/start");
}

export async function createDatabaseBackup(formData: FormData) {
	const id = String(formData.get("id"));

	console.log("Creating backup for workspace", id);
	execFileSync("sqlite3", [
		`sqlite/${id}.db ".backup /tmp/${id}_backup_${Date.now()}.db"`,
	]);
}
