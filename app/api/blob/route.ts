import { db } from "@/drizzle/db";
import { blob, documentFolder } from "@/drizzle/schema";
import { upload } from "@/lib/blobStore";
import { getAppBaseUrl } from "@/lib/utils/url";
import { getOwner } from "@/lib/utils/useOwner";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import mime from "mime-types";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type BlobUploadResult = {
  message: string;
  url: string;
};

export async function PUT(request: NextRequest) {
  const { ownerId, userId } = getOwner();
  const body = await request.blob();
  const extension = mime.extension(body.type);
  const folder = request.nextUrl.searchParams.get("folder") ?? null;
  const name = request.nextUrl.searchParams.get("name") ?? uuidv4();

  try {
    if (folder) {
      const verifyFolder = await db.query.documentFolder.findFirst({
        columns: {
          id: true,
        },
        where: eq(documentFolder.id, Number(folder)),
        with: {
          project: {
            columns: {
              organizationId: true,
            },
          },
        },
      });

      if (!verifyFolder || verifyFolder?.project?.organizationId !== ownerId) {
        return NextResponse.error();
      }
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
        organizationId: ownerId,
        createdByUser: userId,
        documentFolderId: folder ? Number(folder) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .get();

    // TODO: relvalidate path?
    return NextResponse.json<BlobUploadResult>({
      message: "ok",
      url: `${getAppBaseUrl()}/api/blob/${fileId}/file.${extension}`,
    });
  } catch (error) {
    console.log("Error uploading file", error);
    return NextResponse.error();
  }
}
