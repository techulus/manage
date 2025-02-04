import type * as React from "react";
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

interface Props {
	url: string;
}

export const MagicLinkEmail = ({ url }: Props) => (
	<Html>
		<Head />
		<Preview>Log in with this magic link</Preview>
		<Body style={main}>
			<Container style={container}>
				<Heading style={h1}>Login to Manage</Heading>
				<Link
					href={url}
					target="_blank"
					style={{
						...link,
						display: "block",
						marginBottom: "16px",
					}}
				>
					Click here to log in with this magic link
				</Link>
				<Text
					style={{
						...text,
						color: "#ababab",
						marginTop: "14px",
						marginBottom: "16px",
					}}
				>
					If you didn&apos;t try to login, you can safely ignore this email.
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
