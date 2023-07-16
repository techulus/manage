import PageTitle from "@/components/layout/page-title";
import { DocumentFolderHeader } from "@/components/project/document/document-folder-header";
import { DocumentHeader } from "@/components/project/document/document-header";
import { db } from "@/drizzle/db";
import { document, documentFolder } from "@/drizzle/schema";
import { getProjectById } from "@/lib/utils/useProjects";
import { eq, and, isNull } from "drizzle-orm";

type Props = {
  params: {
    projectId: string;
  };
};

export default async function DocumentsList({ params }: Props) {
  const { projectId } = params;

  const project = await getProjectById(projectId);

  const documents = await db.query.document.findMany({
    with: {
      user: {
        columns: {
          firstName: true,
          imageUrl: true,
        },
      },
    },
    where: and(
      eq(document.projectId, Number(projectId)),
      isNull(document.folderId)
    ),
  });

  const documentFolders = await db.query.documentFolder.findMany({
    with: {
      user: {
        columns: {
          firstName: true,
          imageUrl: true,
        },
      },
      // I can't get count query to work, so I'm just selecting the id :(
      documents: {
        columns: {
          id: true,
        },
      },
    },
    where: eq(documentFolder.projectId, Number(projectId)),
  });

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <>
      <PageTitle
        title="Documents"
        subTitle={project.name}
        backUrl={`/console/projects/${projectId}`}
        actionLabel="New"
        actionLink={`/console/projects/${projectId}/documents/new`}
      />

      <div className="mx-auto my-12 max-w-5xl px-4 lg:px-0">
        <div className="mx-auto max-w-2xl space-y-12 lg:mx-0 lg:max-w-none">
          {documentFolders.length ? (
            <div>
              <h2 className="mb-4 text-2xl font-bold">Folders</h2>
              <ul
                role="list"
                className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2"
              >
                {documentFolders.map((folder) => (
                  <div
                    key={folder.id}
                    className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
                  >
                    <DocumentFolderHeader documentFolder={folder} />
                  </div>
                ))}
              </ul>
            </div>
          ) : null}

          {documents.length ? (
            <div>
              <h2 className="mb-4 text-2xl font-bold">Documents</h2>
              <ul
                role="list"
                className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2"
              >
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
                  >
                    {/* @ts-ignore */}
                    <DocumentHeader document={document} />
                  </div>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
