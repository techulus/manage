import { ContentBlock } from "@/components/core/content-block";
import PageTitle from "@/components/layout/page-title";

export const dynamic = "force-dynamic";

export default async function Today() {
  return (
    <>
      <PageTitle title="Today" />

      <ContentBlock>
        <h1>Hello</h1>
      </ContentBlock>
    </>
  );
}
