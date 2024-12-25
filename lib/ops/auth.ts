import { logtoConfig } from "@/app/logto";

const applicationId = process.env.LOGTO_M2M_APP_ID!;
const applicationSecret = process.env.LOGTO_M2M_APP_SECRET!;
const tenantId = "default";

export const fetchAccessToken = async () => {
	const { endpoint } = logtoConfig();
	return await fetch(`${endpoint}oidc/token`, {
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
	});
};

export const createOrganizationForUser = async (
	userId: string,
	name: string,
) => {
	const { access_token } = await fetchAccessToken().then((res) => res.json());
	if (!access_token) {
		throw new Error("Access token not found");
	}

	const { endpoint } = logtoConfig();
	const response = await fetch(`${endpoint}api/organizations`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${access_token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name,
		}),
	});

	if (!response.ok) {
		console.error("Failed to create organization", response.status);
		throw new Error("Failed to create organization");
	}

	const organization = await response.json();
	console.log("organization", organization);

	// Add user to organization
	await fetch(`${endpoint}api/organizations/${organization.id}/users`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${access_token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			userIds: [userId],
		}),
	});

	return organization;
};

export const getOrganizationsForUser = async (userId: string) => {
	const { access_token } = await fetchAccessToken().then((res) => res.json());
	if (!access_token) {
		throw new Error("Access token not found");
	}

	const { endpoint } = logtoConfig();
	const response = await fetch(`${endpoint}api/organizations`, {
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
	console.log("organizations", organizations);

	return organizations;
};
