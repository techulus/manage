import { MarkdownView } from "@/components/core/markdown-view";
import PageTitle from "@/components/layout/page-title";
import { DocumentHeader } from "@/components/project/document/document-header";
import { db } from "@/drizzle/db";
import { document } from "@/drizzle/schema";
import { getProjectById } from "@/lib/utils/useProjects";
import { eq } from "drizzle-orm";

type Props = {
  params: {
    projectId: string;
  };
};

export default async function DocumentsList({ params }: Props) {
  const { projectId } = params;

  const project = await getProjectById(projectId);

  const documents = await db
    .select()
    .from(document)
    .where(eq(document.projectId, Number(projectId)))
    .all();

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <>
      <PageTitle
        title="Documents"
        subTitle={project.name}
        backUrl={`/console/projects/${projectId}`}
        actionLabel="New Document"
        actionLink={`/console/projects/${projectId}/documents/new`}
      />

      <div className="mx-auto max-w-5xl px-4 lg:px-0 my-12">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
          <ul role="list" className="mt-6 space-y-6">
            {documents.map((document) => (
              <div
                key={document.id}
                className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
              >
                <DocumentHeader document={document} />
                <div className="p-6">
                  <MarkdownView content={document.markdownContent} />
                </div>
              </div>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
