import { blob } from "@/drizzle/schema";
import { getUrl } from "@/lib/blobStore";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

export async function GET(
	_: NextRequest,
	props: { params: Promise<{ fileId: string; fileName: string }> },
) {
	const params = await props.params;
	const { ownerId } = await getOwner();
	const db = await database();
	const { fileId } = params;
	const key = `${ownerId}/${fileId}`;

	const fileDetails = await db.query.blob.findFirst({
		where: eq(blob.key, key),
	});

	if (!fileDetails) {
		return new Response("Not found", { status: 404 });
	}

	try {
		const signedUrl = await getUrl(key);
		const file = await fetch(signedUrl);

		const headers = new Headers();
		headers.set("Content-Type", fileDetails.contentType);

		return new Response(await file.blob(), {
			headers,
		});
	} catch (e) {
		return new Response("Not found", { status: 404 });
	}
}
