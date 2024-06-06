import { blob } from "@/drizzle/schema";
import { getUrl } from "@/lib/blobStore";
import { database } from "@/lib/utils/useDatabase";
import { getOwner } from "@/lib/utils/useOwner";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { fileId: string; fileName: string } }
) {
  const { ownerId } = getOwner();
  const db = database();
  const { fileId } = params;
  const key = `${ownerId}/${fileId}`;

  const fileDetails = await db.query.blob.findFirst({
    where: and(eq(blob.organizationId, ownerId), eq(blob.key, key)),
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
