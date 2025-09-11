import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";

interface ThirtyDayDeletionNoticeProps {
	firstName?: string;
	email: string;
	organizationName?: string;
}

export const OrgDeletionNotice = ({
	firstName,
	email,
	organizationName,
}: ThirtyDayDeletionNoticeProps) => {
	const isOrganization = !!organizationName;
	const previewText = isOrganization
		? `Your Manage organization "${organizationName}" will be deleted in 60 days due to inactivity`
		: "Your Manage account will be deleted in 60 days due to inactivity";

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Body style={main}>
				<Container style={container}>
					<Section style={header}>
						<Heading style={h1}>
							{isOrganization
								? "Organization Deletion Notice"
								: "Account Deletion Notice"}
						</Heading>
					</Section>

					<Section style={content}>
						<Text style={text}>Hello {firstName || "there"},</Text>

						<Text style={text}>
							{isOrganization
								? `We noticed that your Manage organization "${organizationName}" has been inactive for 60 days. 
                To keep our platform secure and efficient, we automatically remove inactive organizations.`
								: `We noticed that your Manage account (${email}) has been inactive for 60 days. 
                To keep our platform secure and efficient, we automatically remove inactive accounts.`}
						</Text>

						<Text style={text}>
							<strong>
								{isOrganization
									? `Your organization "${organizationName}" will be permanently deleted in 60 days`
									: "Your account will be permanently deleted in 60 days"}
							</strong>{" "}
							unless you log in and use the platform.
						</Text>

						<Text style={text}>
							{isOrganization
								? `If you'd like to keep your organization, simply log in to Manage within the next 60 days. 
                All your projects, tasks, and data will remain intact.`
								: `If you'd like to keep your account, simply log in to Manage within the next 60 days. 
                All your projects, tasks, and data will remain intact.`}
						</Text>

						<Section style={buttonContainer}>
							<Button style={button} href="https://managee.xyz/start">
								{isOrganization
									? "Keep My Organization Active"
									: "Keep My Account Active"}
							</Button>
						</Section>

						<Text style={text}>
							{isOrganization
								? `If you no longer wish to use Manage, you don't need to do anything. 
                Your organization and all associated data will be automatically deleted.`
								: `If you no longer wish to use Manage, you don't need to do anything. 
                Your account and all associated data will be automatically deleted.`}
						</Text>

						<Text style={footer}>
							Best regards,
							<br />
							The Manage Team
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
};

const main = {
	backgroundColor: "#f6f9fc",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
	backgroundColor: "#ffffff",
	margin: "0 auto",
	padding: "20px 0 48px",
	marginBottom: "64px",
};

const header = {
	padding: "32px 24px",
	borderBottom: "1px solid #e6ebf1",
};

const content = {
	padding: "24px",
};

const h1 = {
	color: "#1f2937",
	fontSize: "24px",
	fontWeight: "600",
	lineHeight: "32px",
	margin: "0",
};

const text = {
	color: "#374151",
	fontSize: "16px",
	lineHeight: "24px",
	margin: "16px 0",
};

const buttonContainer = {
	textAlign: "center" as const,
	margin: "32px 0",
};

const button = {
	backgroundColor: "hsl(142.1, 76.2%, 36.3%)",
	borderRadius: "6px",
	color: "#ffffff",
	fontSize: "16px",
	fontWeight: "600",
	textDecoration: "none",
	textAlign: "center" as const,
	display: "inline-block",
	padding: "12px 24px",
};

const footer = {
	color: "#6b7280",
	fontSize: "14px",
	lineHeight: "20px",
	margin: "32px 0 0",
};

export function DeletionNoticePlainText({
	firstName,
	email,
	organizationName,
}: ThirtyDayDeletionNoticeProps): string {
	const isOrganization = !!organizationName;

	return `${isOrganization ? "Organization Deletion Notice" : "Account Deletion Notice"}

Hello ${firstName || "there"},

${
	isOrganization
		? `We noticed that your Manage organization "${organizationName}" has been inactive for 60 days. To keep our platform secure and efficient, we automatically remove inactive organizations.`
		: `We noticed that your Manage account (${email}) has been inactive for 60 days. To keep our platform secure and efficient, we automatically remove inactive accounts.`
}

${
	isOrganization
		? `Your organization "${organizationName}" will be permanently deleted in 60 days`
		: "Your account will be permanently deleted in 60 days"
} unless you log in and use the platform.

${
	isOrganization
		? `If you'd like to keep your organization, simply log in to Manage within the next 60 days. All your projects, tasks, and data will remain intact.`
		: `If you'd like to keep your account, simply log in to Manage within the next 60 days. All your projects, tasks, and data will remain intact.`
}

${isOrganization ? "Keep My Organization Active" : "Keep My Account Active"}: https://managee.xyz/start

${
	isOrganization
		? `If you no longer wish to use Manage, you don't need to do anything. Your organization and all associated data will be automatically deleted.`
		: `If you no longer wish to use Manage, you don't need to do anything. Your account and all associated data will be automatically deleted.`
}

Best regards,
The Manage Team`;
}

export default OrgDeletionNotice;
