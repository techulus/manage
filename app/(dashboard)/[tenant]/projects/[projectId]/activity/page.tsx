import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { ActivityFeed } from "@/components/project/activity/activity-feed";

export default function ActivityDetails() {
	return (
		<>
			<PageTitle title="Activity" />

			<PageSection>
				<ActivityFeed />
			</PageSection>
		</>
	);
}
