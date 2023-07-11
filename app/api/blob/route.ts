import { db } from "@/drizzle/db";
import { blobs } from "@/drizzle/schema";
import { blobStorage } from "@/lib/blobStore";
import { getAppBaseUrl } from "@/lib/utils/url";
import { getOwner } from "@/lib/utils/useOwner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

export type BlobUploadResult = {
  message: string;
  url: string;
};

export async function PUT(request: Request) {
  const { ownerId } = getOwner();
  const body = await request.blob();

  try {
    const fileKey = uuidv4();
    const input = {
      "Body": await body.arrayBuffer(),
      "Bucket": process.env.R2_BUCKET_NAME!,
      "Key": `${ownerId}/${fileKey}`,
      "Type": body.type,
    };

    // @ts-ignore I don't know why this is not working
    const command = new PutObjectCommand(input);
    await blobStorage.send(command);

    await db
      .insert(blobs)
      .values({
        id: uuidv4(),
        key: input.Key,
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
