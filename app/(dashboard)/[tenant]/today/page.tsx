import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";

export default async function Today() {
  return (
    <>
      <PageTitle title="Today" />

      <PageSection topInset>
        <h1 className="p-8">Hello</h1>
      </PageSection>
    </>
  );
}
