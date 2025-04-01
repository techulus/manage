import path from "node:path";
import { OtpEmail } from "@/components/emails/otp-email";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { emailOTP, organization } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import Redis from "ioredis";
import { Resend } from "resend";

const redis = process.env.REDIS_URL
	? new Redis(process.env.REDIS_URL)
	: undefined;

export const auth = () =>
	betterAuth({
		database: {
			dialect: new LibsqlDialect({
				// url: `file:${path.resolve(process.cwd(), "sqlite", "auth")}.db`,
				// syncUrl: `libsql://${process.env.TURSO_GROUP}-auth-${process.env.TURSO_ORG}.turso.io`,
				url: `libsql://${process.env.TURSO_GROUP}-auth-${process.env.TURSO_ORG}.turso.io`,
				authToken: process.env.TURSO_GROUP_TOKEN,
			}),
			type: "sqlite",
		},
		plugins: [
			emailOTP({
				async sendVerificationOTP({ email, otp, type }) {
					console.log("Send otp email", email, otp, type);
					const resend = new Resend(process.env.RESEND_API_KEY);
					const { data, error } = await resend.emails.send({
						from: "Manage <account@email.managee.xyz>",
						to: [email],
						subject: "Your Login Code",
						react: OtpEmail({ otp }),
					});
					console.log("Email Result ->", error ?? data);
				},
				disableSignUp: true,
			}),
			passkey(
				process.env.NODE_ENV === "production"
					? {
							rpID: "managee.xyz",
							rpName: "Manage",
						}
					: undefined,
			),
			organization(),
			nextCookies(),
		],
		baseURL: process.env.BETTER_AUTH_URL,
		trustedOrigins: [process.env.BETTER_AUTH_URL!],
		secondaryStorage: redis
			? {
					get: async (key) => {
						const value = await redis.get(key);
						return value ? value : null;
					},
					set: async (key, value, ttl) => {
						if (ttl) {
							await redis.set(key, value, "EX", ttl);
						} else {
							await redis.set(key, value);
						}
					},
					delete: async (key) => {
						await redis.del(key);
					},
				}
			: undefined,
	});
