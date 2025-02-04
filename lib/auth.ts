import { betterAuth } from "better-auth";
import { magicLink, organization } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import Database from "better-sqlite3";
import { Resend } from "resend";
import { MagicLinkEmail } from "@/components/emails/magic-link";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
	database: new Database("./sqlite/auth.db"),
	plugins: [
		magicLink({
			sendMagicLink: async ({ email, url }) => {
				console.log("Send magic link", email, url);
				const { data, error } = await resend.emails.send({
					from: "Manage <account@email.managee.xyz>",
					to: [email],
					subject: "Your Magic Link",
					react: MagicLinkEmail({ url }),
				});
				console.log("Email Result ->", error ?? data);
			},
		}),
		organization(),
		nextCookies(),
	],
	trustedOrigins: [process.env.BETTER_AUTH_URL!],
});
