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

interface SevenDayWarningProps {
	firstName?: string;
	email: string;
	organizationName?: string;
}

export const SevenDayWarning = ({
	firstName,
	email,
	organizationName,
}: SevenDayWarningProps) => {
	const isOrganization = !!organizationName;
	const previewText = isOrganization
		? `FINAL WARNING: Your Manage organization "${organizationName}" will be deleted in 7 days`
		: "FINAL WARNING: Your Manage account will be deleted in 7 days";

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Body style={main}>
				<Container style={container}>
					<Section style={header}>
						<Heading style={h1}>
							🚨 Final Warning: {isOrganization ? "Organization" : "Account"}{" "}
							Deletion in 7 Days
						</Heading>
					</Section>

					<Section style={content}>
						<Text style={text}>Hello {firstName || "there"},</Text>

						<Text style={urgentText}>
							{isOrganization
								? `This is your final warning. Your Manage organization "${organizationName}" will be permanently deleted in 7 days.`
								: `This is your final warning. Your Manage account (${email}) will be permanently deleted in 7 days.`}
						</Text>

						<Text style={text}>
							{isOrganization
								? `We sent you a notice 23 days ago about your inactive organization, but we haven't seen any activity since then.`
								: `We sent you a notice 23 days ago about your inactive account, but we haven't seen any activity since then.`}
						</Text>

						<Text style={text}>
							<strong>What happens if you don't act:</strong>
						</Text>

						<Text style={text}>
							{isOrganization ? (
								<>
									• Your organization will be permanently deleted
									<br />• All projects and tasks will be lost
									<br />• This action cannot be undone
								</>
							) : (
								<>
									• Your account will be permanently deleted
									<br />• All your projects and tasks will be lost
									<br />• This action cannot be undone
								</>
							)}
						</Text>

						<Text style={text}>
							<strong>
								{isOrganization
									? "To save your organization:"
									: "To save your account:"}
							</strong>{" "}
							Simply log in to Manage within the next 7 days.
						</Text>

						<Section style={buttonContainer}>
							<Button style={urgentButton} href="https://managee.xyz/start">
								{isOrganization
									? "Save My Organization Now"
									: "Save My Account Now"}
							</Button>
						</Section>

						<Text style={text}>
							{isOrganization
								? "If you no longer want to use Manage, you can ignore this email and your organization will be automatically deleted."
								: "If you no longer want to use Manage, you can ignore this email and your account will be automatically deleted."}
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
	backgroundColor: "#fef2f2",
};

const content = {
	padding: "24px",
};

const h1 = {
	color: "#dc2626",
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

const urgentText = {
	color: "#dc2626",
	fontSize: "16px",
	lineHeight: "24px",
	margin: "16px 0",
	fontWeight: "600",
	padding: "16px",
	backgroundColor: "#fef2f2",
	borderLeft: "4px solid #ef4444",
	borderRadius: "4px",
};

const buttonContainer = {
	textAlign: "center" as const,
	margin: "32px 0",
};

const urgentButton = {
	backgroundColor: "#ef4444",
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

export function sevenDayWarningPlainText({
	firstName,
	email,
	organizationName,
}: SevenDayWarningProps): string {
	const isOrganization = !!organizationName;

	return `🚨 Final Warning: ${isOrganization ? "Organization" : "Account"} Deletion in 7 Days

Hello ${firstName || "there"},

${
	isOrganization
		? `This is your final warning. Your Manage organization "${organizationName}" will be permanently deleted in 7 days.`
		: `This is your final warning. Your Manage account (${email}) will be permanently deleted in 7 days.`
}

${
	isOrganization
		? `We sent you a notice 23 days ago about your inactive organization, but we haven't seen any activity since then.`
		: `We sent you a notice 23 days ago about your inactive account, but we haven't seen any activity since then.`
}

What happens if you don't act:
${
	isOrganization
		? `• Your organization will be permanently deleted
• All projects and tasks will be lost
• This action cannot be undone`
		: `• Your account will be permanently deleted
• All your projects and tasks will be lost
• This action cannot be undone`
}

${isOrganization ? "To save your organization:" : "To save your account:"} Simply log in to Manage within the next 7 days.

${isOrganization ? "Save My Organization Now" : "Save My Account Now"}: https://managee.xyz/start

${
	isOrganization
		? "If you no longer want to use Manage, you can ignore this email and your organization will be automatically deleted."
		: "If you no longer want to use Manage, you can ignore this email and your account will be automatically deleted."
}

Best regards,
The Manage Team`;
}

export default SevenDayWarning;
