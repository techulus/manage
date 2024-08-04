import { blob, document, documentFolder } from "@/drizzle/schema";
import { upload } from "@/lib/blobStore";
import { getAppBaseUrl } from "@/lib/utils/url";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { eq } from "drizzle-orm";
import mime from "mime-types";
import { revalidatePath } from "next/cache";
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
	const folder = request.nextUrl.searchParams.get("folder") ?? null;
	const projectId = request.nextUrl.searchParams.get("projectId");
	const name = request.nextUrl.searchParams.get("name") ?? uuidv4();

	const db = await database();

	try {
		if (folder) {
			const verifyFolder = await db.query.documentFolder.findFirst({
				columns: {
					id: true,
				},
				where: eq(documentFolder.id, +folder),
			});

			if (!verifyFolder) {
				return NextResponse.error();
			}
		}

		if (body.type === "text/markdown" && projectId && folder) {
			if (!projectId || !folder) {
				return NextResponse.error();
			}

			const content = await body.text();
			await db
				.insert(document)
				.values({
					name,
					markdownContent: content,
					status: "active",
					projectId: +projectId,
					folderId: +folder,
					createdByUser: userId,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.run();

			revalidatePath(
				`/console/projects/${projectId}/documents/folders/${folder}`,
			);

			return NextResponse.json<BlobUploadResult>({
				message: "ok",
				url: `${getAppBaseUrl()}/console/projects/${projectId}/documents/folders/${folder}`,
			});
		}

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
				documentFolderId: folder ? +folder : null,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning()
			.get();

		if (folder) {
			revalidatePath(
				`/console/projects/${projectId}/documents/folders/${folder}`,
			);
		}

		return NextResponse.json<BlobUploadResult>({
			message: "ok",
			url: `${getAppBaseUrl()}/api/blob/${fileId}/file.${extension}`,
		});
	} catch (error) {
		console.log("Error uploading file", error);
		return NextResponse.error();
	}
}
