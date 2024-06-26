import { ContentBlock } from "@/components/core/content-block";
import { SaveButton } from "@/components/form/button";
import EventForm from "@/components/form/event";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { allUser } from "@/lib/utils/useOwner";
import Link from "next/link";
import { createEvent } from "../actions";

type Props = {
  params: {
    projectId: string;
  };
};

export default async function CreateEvent({ params }: Props) {
  const backUrl = `/console/projects/${params.projectId}/events`;

  const users = await allUser();

  return (
    <>
      <PageTitle title="Create Event" backUrl={backUrl} />
      <form action={createEvent} className="xl:-mt-8">
        <input type="hidden" name="projectId" defaultValue={params.projectId} />
        <ContentBlock>
          <CardContent>
            <EventForm users={users} />
          </CardContent>
          <CardFooter>
            <div className="ml-auto flex items-center justify-end gap-x-6">
              <Link
                href={backUrl}
                className={buttonVariants({ variant: "ghost" })}
                prefetch={false}
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
