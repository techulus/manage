import { logtoConfig } from "@/app/logto";
import type { UserInfoResponse } from "@logto/next/*";

const applicationId = process.env.LOGTO_M2M_APP_ID!;
const applicationSecret = process.env.LOGTO_M2M_APP_SECRET!;
const tenantId = "default";

/**
 * Management API docs
 * https://openapi.logto.io
 */
export interface UserCustomData {
	timezone: string;
}

export interface LogtoAccessToken {
	access_token: string;
	token_type: string;
	expires_in: number;
	scope: string;
}

export interface Organization {
	tenantId: string;
	id: string;
	name: string;
	description: string;
	customData: Record<string, string | number | boolean>;
	isMfaRequired: boolean;
	branding: {
		logoUrl: string;
		darkLogoUrl: string;
		favicon: string;
		darkFavicon: string;
	};
	createdAt: number;
	organizationRoles: {
		id: string;
		name: string;
	}[];
}

export const fetchAccessToken = async () => {
	const { endpoint } = logtoConfig;

	const token = await fetch(`${endpoint}oidc/token`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: `Basic ${Buffer.from(
				`${applicationId}:${applicationSecret}`,
			).toString("base64")}`,
		},
		body: new URLSearchParams({
			grant_type: "client_credentials",
			resource: `https://${tenantId}.logto.app/api`,
			scope: "all",
		}).toString(),
	}).then((res) => res.json());

	return token;
};

export const getUser = async (userId: string): Promise<UserInfoResponse> => {
	const { access_token } = await fetchAccessToken();
	if (!access_token) {
		throw new Error("Access token not found");
	}

	const { endpoint } = logtoConfig;
	const response = await fetch(`${endpoint}api/users/${userId}`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${access_token}`,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		console.error("Failed to fetch user", response.status);
		throw new Error("Failed to fetch user");
	}

	return await response.json();
};

export const updateUser = async (
	userId: string,
	data: {
		name?: string;
		primaryEmail?: string;
		customData?: Record<string, unknown>;
	},
) => {
	const { access_token } = await fetchAccessToken();
	if (!access_token) {
		throw new Error("Access token not found");
	}

	const { endpoint } = logtoConfig;
	const response = await fetch(`${endpoint}api/users/${userId}`, {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${access_token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		console.error("Failed to update user", response.status);
		throw new Error("Failed to update user");
	}

	return await response.json();
};

export const getOrganizationsForUser = async (
	userId: string,
): Promise<Organization[]> => {
	const { access_token } = await fetchAccessToken();
	if (!access_token) {
		throw new Error("Access token not found");
	}

	const { endpoint } = logtoConfig;
	const response = await fetch(`${endpoint}api/users/${userId}/organizations`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${access_token}`,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		console.error("Failed to fetch organizations", response.status);
		throw new Error("Failed to fetch organizations");
	}
	const organizations = await response.json();

	return organizations;
};
