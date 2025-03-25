import {
	emailOTPClient,
	organizationClient,
	passkeyClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_APP_URL,
	plugins: [emailOTPClient(), passkeyClient(), organizationClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
