import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Img,
	Link,
	Preview,
	Text,
} from "@react-email/components";
import type * as React from "react";

export const OtpEmail = ({ otp }: { otp: string }) => (
	<Html>
		<Head />
		<Preview>Your login code for Manage</Preview>
		<Body style={main}>
			<Container style={container}>
				<Heading style={h1}>Your Login Code</Heading>
				<Text
					style={{
						...text,
						fontSize: "32px",
						fontWeight: "bold",
						letterSpacing: "8px",
						margin: "32px 0",
					}}
				>
					{otp}
				</Text>
				<Text style={text}>
					Enter this code to log in to your Manage account. This code will
					expire in 5 minutes.
				</Text>
				<Text
					style={{
						...text,
						color: "#ababab",
						marginTop: "14px",
						marginBottom: "16px",
					}}
				>
					If you didn't try to login, you can safely ignore this email.
				</Text>
				<Img
					src="https://managee.xyz/images/logo.png"
					width="32"
					height="32"
					alt="Manage's Logo"
				/>
				<Text style={footer}>
					<Link
						href={process.env.BETTER_AUTH_URL}
						target="_blank"
						style={{ ...link, color: "#898989" }}
					>
						managee.xyz
					</Link>
					, Manage Tasks, Documents, Files, and Events with Ease
				</Text>
			</Container>
		</Body>
	</Html>
);

const main = {
	backgroundColor: "#ffffff",
};

const container = {
	paddingLeft: "12px",
	paddingRight: "12px",
	margin: "0 auto",
};

const h1 = {
	color: "#333",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "24px",
	fontWeight: "bold",
	margin: "40px 0",
	padding: "0",
};

const link = {
	color: "#2754C5",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "14px",
	textDecoration: "underline",
};

const text = {
	color: "#333",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "14px",
	margin: "24px 0",
};

const footer = {
	color: "#898989",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "12px",
	lineHeight: "22px",
	marginTop: "12px",
	marginBottom: "24px",
};
