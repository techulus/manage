import { ContentBlock } from "@/components/core/content-block";
import { SaveButton } from "@/components/form/button";
import EventForm from "@/components/form/event";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { createEvent } from "../actions";

type Props = {
  params: {
    projectId: string;
  };
};

export default async function CreateEvent({ params }: Props) {
  const backUrl = `/console/projects/${params.projectId}`;

  return (
    <>
      <PageTitle title="Create Event" backUrl={backUrl} />
      <form action={createEvent}>
        <input type="hidden" name="projectId" defaultValue={params.projectId} />
        <ContentBlock>
          <CardContent>
            <EventForm />
          </CardContent>
          <CardFooter>
            <div className="ml-auto flex items-center justify-end gap-x-6">
              <Link
                href={backUrl}
                className={buttonVariants({ variant: "ghost" })}
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
