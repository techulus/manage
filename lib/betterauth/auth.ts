import { MagicLinkEmail } from "@/components/emails/magic-link";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { magicLink, organization } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import Database from "better-sqlite3";
import { Resend } from "resend";

export const auth = () =>
	betterAuth({
		database: new Database("./sqlite/auth.db"),
		plugins: [
			magicLink({
				sendMagicLink: async ({ email, url }) => {
					console.log("Send magic link", email, url);
					const resend = new Resend(process.env.RESEND_API_KEY);
					const { data, error } = await resend.emails.send({
						from: "Manage <account@email.managee.xyz>",
						to: [email],
						subject: "Your Magic Link",
						react: MagicLinkEmail({ url }),
					});
					console.log("Email Result ->", error ?? data);
				},
			}),
			passkey({
				rpID: "managee.xyz",
				rpName: "Manage",
			}),
			organization(),
			nextCookies(),
		],
		trustedOrigins: [process.env.BETTER_AUTH_URL!],
	});
