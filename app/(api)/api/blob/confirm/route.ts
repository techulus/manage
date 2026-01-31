import mime from "mime-types";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { blob } from "@/drizzle/schema";
import { headObject } from "@/lib/blobStore";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";

export type ConfirmResponse = {
	url: string;
};

export async function POST(request: NextRequest) {
	const { userId } = await getOwner();

	const body = await request.json();
	const { fileId } = body as { fileId: string };

	if (!fileId) {
		return NextResponse.json(
			{ error: "Missing fileId" },
			{ status: 400 },
		);
	}

	const db = database();

	try {
		const [blobRecord] = await db
			.select()
			.from(blob)
			.where(eq(blob.id, fileId))
			.limit(1);

		if (!blobRecord) {
			return NextResponse.json({ error: "File not found" }, { status: 404 });
		}

		if (blobRecord.createdByUser !== userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		if (blobRecord.status === "confirmed") {
			const extension = mime.extension(blobRecord.contentType);
			return NextResponse.json<ConfirmResponse>({
				url: `${process.env.NEXT_PUBLIC_APP_URL}/api/blob/${fileId}/file.${extension}`,
			});
		}

		const exists = await headObject(blobRecord.key);
		if (!exists) {
			return NextResponse.json(
				{ error: "File not uploaded to storage" },
				{ status: 400 },
			);
		}

		await db
			.update(blob)
			.set({
				status: "confirmed",
				updatedAt: new Date(),
			})
			.where(eq(blob.id, fileId))
			.execute();

		const extension = mime.extension(blobRecord.contentType);
		return NextResponse.json<ConfirmResponse>({
			url: `${process.env.NEXT_PUBLIC_APP_URL}/api/blob/${fileId}/file.${extension}`,
		});
	} catch (error) {
		console.error("Error confirming upload", error);
		return NextResponse.json(
			{ error: "Failed to confirm upload" },
			{ status: 500 },
		);
	}
}
