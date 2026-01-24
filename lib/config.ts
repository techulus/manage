export function isSignupDisabled() {
	return process.env.DISABLE_SIGNUPS === "true";
}
