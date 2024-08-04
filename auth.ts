import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { opsDb } from "./ops/database";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(opsDb()),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: "account@email.managee.xyz",
    }),
    // Passkey,
  ],
  pages: {
    signIn: "/sign-in",
    newUser: "/console/start",
  },
  experimental: { enableWebAuthn: true },
});
