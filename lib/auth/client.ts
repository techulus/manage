import { createAuthClient } from "better-auth/react";
import { emailOTPClient, organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_APP_URL,
	plugins: [emailOTPClient(), organizationClient()],
});

export const {
	signIn,
	signOut,
	useSession,
	useActiveOrganization,
	organization,
} = authClient;
