import { db } from "@/drizzle/db";
import { blob } from "@/drizzle/schema";
import { upload } from "@/lib/blobStore";
import { getAppBaseUrl } from "@/lib/utils/url";
import { getOwner } from "@/lib/utils/useOwner";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import mime from "mime-types";

export type BlobUploadResult = {
  message: string;
  url: string;
};

export async function PUT(request: NextRequest) {
  const { ownerId } = getOwner();
  const body = await request.blob();
  const extension = mime.extension(body.type);

  try {
    const fileKey = uuidv4();
    const key = `${ownerId}/${fileKey}`;

    await upload(key, {
      content: await body.arrayBuffer(),
      type: body.type,
    });

    await db
      .insert(blob)
      .values({
        key: key,
        contentType: body.type,
        contentSize: body.size,
        organizationId: ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .get();

    return NextResponse.json<BlobUploadResult>({
      message: "ok",
      url: `${getAppBaseUrl()}/api/blob/${fileKey}/file.${extension}`,
    });
  } catch (error) {
    console.log("Error uploading file", error);
    return NextResponse.error();
  }
}
