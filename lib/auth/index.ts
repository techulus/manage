import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, organization } from "better-auth/plugins";
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
		emailOTP({
			otpLength: 6,
			expiresIn: 600,
			sendVerificationOTP: async ({ email, otp }) => {
				await resend.emails.send({
					from: getFromEmail(),
					to: email,
					subject: "Your verification code for Manage",
					html: `
						<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
							<h2>Your verification code</h2>
							<p>Enter this code to sign in to Manage:</p>
							<div style="background: #f4f4f5; padding: 16px 24px; border-radius: 6px; margin: 16px 0; text-align: center;">
								<span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: monospace;">${otp}</span>
							</div>
							<p style="color: #666; font-size: 14px;">
								If you didn't request this code, you can safely ignore it.
							</p>
							<p style="color: #666; font-size: 14px;">
								This code will expire in 10 minutes.
							</p>
						</div>
					`,
				});
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
