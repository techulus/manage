export const PERSONAL_TENANT = "me";

export function isPersonalTenant(tenant: string) {
	return tenant === PERSONAL_TENANT;
}
