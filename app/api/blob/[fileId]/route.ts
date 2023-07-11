import { blobStorage } from "@/lib/blobStore";
import { getOwner } from "@/lib/utils/useOwner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function GET(
  _: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const { ownerId } = getOwner();
  const { fileId } = params;

  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: `${ownerId}/${fileId}`
  });
  const signedUrl = await getSignedUrl(blobStorage, command, {
    expiresIn: 3600,
  });
  const file = await fetch(signedUrl);

  const headers = new Headers();
  headers.set("Content-Type", "image/png");

  return new Response(await file.blob(), {
    headers
  });
}
