import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { blob } from "@/drizzle/schema";
import { getUploadUrl } from "@/lib/blobStore";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/svg+xml",
	"application/pdf",
];

export type PresignResponse = {
	uploadUrl: string;
	fileId: string;
};

export async function POST(request: NextRequest) {
	const { ownerId, userId } = await getOwner();

	const body = await request.json();
	const { fileName, contentType, contentSize } = body as {
		fileName: string;
		contentType: string;
		contentSize: number;
	};

	if (!fileName || !contentType || !contentSize) {
		return NextResponse.json(
			{ error: "Missing required fields" },
			{ status: 400 },
		);
	}

	if (!ALLOWED_TYPES.includes(contentType)) {
		return NextResponse.json(
			{ error: "File type not allowed" },
			{ status: 400 },
		);
	}

	if (contentSize > MAX_FILE_SIZE) {
		return NextResponse.json(
			{ error: "File size exceeds maximum allowed (10MB)" },
			{ status: 400 },
		);
	}

	const db = database();

	try {
		const fileId = randomUUID();
		const key = `${ownerId}/${fileId}`;

		const uploadUrl = await getUploadUrl(key, contentType);

		await db
			.insert(blob)
			.values({
				id: fileId,
				key,
				name: fileName,
				contentType,
				contentSize,
				status: "pending",
				createdByUser: userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.execute();

		return NextResponse.json<PresignResponse>({
			uploadUrl,
			fileId,
		});
	} catch (error) {
		console.error("Error generating presigned URL", error);
		return NextResponse.json(
			{ error: "Failed to generate upload URL" },
			{ status: 500 },
		);
	}
}
