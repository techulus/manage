import { ContentBlock } from "@/components/core/content-block";
import { SaveButton } from "@/components/form/button";
import SharedForm from "@/components/form/shared";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { updateTaskList } from "../../actions";
import { prisma } from "@/lib/utils/db";

type Props = {
  params: {
    projectId: string;
    tasklistId: string;
  };
};

export default async function EditTaskList({ params }: Props) {
  const tasklist = await prisma.taskList.findUnique({
    where: {
      id: Number(params.tasklistId),
    },
  });

  const backUrl = `/console/projects/${params.projectId}/tasklists`;

  return (
    <>
      <PageTitle title="Update Task list" backUrl={backUrl} />
      <form action={updateTaskList}>
        <input type="hidden" name="id" defaultValue={params.tasklistId} />
        <input type="hidden" name="projectId" defaultValue={params.projectId} />
        <ContentBlock>
          <CardContent>
            <SharedForm item={tasklist} />
          </CardContent>
          <CardFooter>
            <div className="flex ml-auto items-center justify-end gap-x-6">
              <Link
                href={backUrl}
                className={buttonVariants({ variant: "secondary" })}
              >
                Cancel
              </Link>
              <SaveButton />
            </div>
          </CardFooter>
        </ContentBlock>
      </form>
    </>
  );
}
