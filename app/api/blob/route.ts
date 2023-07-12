import { db } from "@/drizzle/db";
import { blob } from "@/drizzle/schema";
import { upload } from "@/lib/blobStore";
import { getAppBaseUrl } from "@/lib/utils/url";
import { getOwner } from "@/lib/utils/useOwner";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export type BlobUploadResult = {
  message: string;
  url: string;
};

export async function PUT(request: Request) {
  const { ownerId } = getOwner();
  const body = await request.blob();

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
      url: `${getAppBaseUrl()}/api/blob/${fileKey}`,
    });
  } catch (e) {
    console.log(e);
    return NextResponse.error();
  }
}
