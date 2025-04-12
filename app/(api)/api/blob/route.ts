import { blob } from "@/drizzle/schema";
import { upload } from "@/lib/blobStore";
import { getAppBaseUrl } from "@/lib/utils/url";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import mime from "mime-types";
import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export type BlobUploadResult = {
	message: string;
	url: string;
};

export async function PUT(request: NextRequest) {
	const { ownerId, userId } = await getOwner();
	const body = await request.blob();
	const extension = mime.extension(body.type);
	const name = request.nextUrl.searchParams.get("name") ?? uuidv4();

	const db = await database();

	try {
		const fileId = uuidv4();
		const key = `${ownerId}/${fileId}`;

		await upload(key, {
			content: await body.arrayBuffer(),
			type: body.type,
		});

		await db
			.insert(blob)
			.values({
				id: fileId,
				key,
				name,
				contentType: body.type,
				contentSize: body.size,
				createdByUser: userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning()
			.execute();

		return NextResponse.json<BlobUploadResult>({
			message: "ok",
			url: `${getAppBaseUrl()}/api/blob/${fileId}/file.${extension}`,
		});
	} catch (error) {
		console.log("Error uploading file", error);
		return NextResponse.error();
	}
}
