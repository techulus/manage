import { remark } from "remark";
import strip from "strip-markdown";

export async function convertMarkdownToPlainText(markdown: string | null) {
  return markdown ? remark().use(strip).processSync(markdown).toString() : "";
}
