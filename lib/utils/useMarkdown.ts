import { blob } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { remark } from "remark";
import strip from "strip-markdown";
import { deleteFile } from "../blobStore";
import { database } from "./useDatabase";

interface Link {
  text: string;
  url: string;
}

interface Image {
  alt: string;
  url: string;
}

interface Result {
  links: Link[];
  images: Image[];
}

export function convertMarkdownToPlainText(markdown: string | null) {
  return markdown ? remark().use(strip).processSync(markdown).toString() : "";
}

export function extractLinksAndImages(markdownText: string): Result {
  // Regular expression for links
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  // Regular expression for images
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

  const links: Link[] = [];
  const images: Image[] = [];

  let match: RegExpExecArray | null;

  // Find all matches for links
  while ((match = linkRegex.exec(markdownText)) !== null) {
    links.push({ text: match[1], url: match[2] });
  }

  // Find all matches for images
  while ((match = imageRegex.exec(markdownText)) !== null) {
    images.push({ alt: match[1], url: match[2] });
  }

  return { links, images };
}

export async function deleteFilesInMarkdown(content: string) {
  const { links, images } = extractLinksAndImages(content);

  for (const linkedFile of [...images, ...links]) {
    if (!linkedFile.url.includes("/api/blob")) {
      continue;
    }

    const parts = linkedFile.url.split("/");
    const fileId = parts[parts.length - 2];
    try {
      const db = await database();
      const file = await db.query.blob.findFirst({
        where: eq(blob.id, fileId),
      });
      if (file) {
        await deleteFile(file.key);
      }
    } catch (error) {
      console.error("Error deleting file", error);
    }
  }
}
