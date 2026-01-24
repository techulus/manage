import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink, organization } from "better-auth/plugins";
import { Resend } from "resend";
import { database } from "@/lib/utils/useDatabase";
import { isSignupDisabled } from "@/lib/config";

const resend = new Resend(process.env.RESEND_API_KEY);

function getFromEmail() {
	const from = process.env.EMAIL_FROM;
	if (!from) {
		throw new Error("EMAIL_FROM environment variable is required");
	}
	return from;
}

export const auth = betterAuth({
	database: drizzleAdapter(database(), {
		provider: "pg",
	}),
	emailAndPassword: {
		enabled: false,
	},
	session: {
		cookieCache: {
			enabled: false,
		},
	},
	plugins: [
		magicLink({
			sendMagicLink: async ({ email, url }) => {
				console.log("[Magic Link] Sending to:", email);
				const response = await resend.emails.send({
					from: getFromEmail(),
					to: email,
					subject: "Sign in to Manage",
					html: `
						<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
							<h2>Sign in to Manage</h2>
							<p>Click the button below to sign in to your account:</p>
							<a href="${url}" style="display: inline-block; background: #171717; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
								Sign in
							</a>
							<p style="color: #666; font-size: 14px;">
								If you didn't request this email, you can safely ignore it.
							</p>
							<p style="color: #666; font-size: 14px;">
								This link will expire in 15 minutes.
							</p>
						</div>
					`,
				});
				console.log(
					"[Magic Link] Resend response:",
					JSON.stringify(response, null, 2),
				);
			},
		}),
		organization({
			allowUserToCreateOrganization: true,
			creatorRole: "owner",
			allowSignupOnInvitation: true,
			sendInvitationEmail: async ({ email, organization, inviter, id }) => {
				const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?email=${encodeURIComponent(email)}&invitationId=${id}`;
				await resend.emails.send({
					from: getFromEmail(),
					to: email,
					subject: `You're invited to join ${organization.name}`,
					html: `
						<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
							<h2>You're invited to join ${organization.name}</h2>
							<p>${inviter.user.name || inviter.user.email} has invited you to join their organization on Manage.</p>
							<a href="${acceptUrl}" style="display: inline-block; background: #171717; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
								Accept Invitation
							</a>
							<p style="color: #666; font-size: 14px;">
								If you didn't expect this invitation, you can safely ignore it.
							</p>
						</div>
					`,
				});
			},
		}),
	],
	user: {
		denySignUp: isSignupDisabled(),
		additionalFields: {
			firstName: {
				type: "string",
				required: false,
			},
			lastName: {
				type: "string",
				required: false,
			},
			timeZone: {
				type: "string",
				required: false,
			},
			lastActiveAt: {
				type: "date",
				required: false,
			},
		},
	},
});

export type Session = typeof auth.$Infer.Session;
