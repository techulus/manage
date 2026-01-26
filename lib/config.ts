export function isSignupDisabled() {
	return process.env.DISABLE_SIGNUPS === "true";
}

export function isSelfHosted() {
	return process.env.SELF_HOSTED === "true";
}
