import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { ActivityFeed } from "@/components/project/activity/activity-feed";
import { fetchActivities } from "../../actions";

type Props = {
	params: Promise<{
		projectId: string;
	}>;
};

export default async function ActivityDetails(props: Props) {
    const params = await props.params;
    const { projectId } = params;

    const activities = await fetchActivities(projectId);

    return (
		<>
			<PageTitle title="Activity" />

			<PageSection topInset>
				<ActivityFeed activities={activities} projectId={projectId} />
			</PageSection>
		</>
	);
}
