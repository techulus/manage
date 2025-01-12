"use client";

import { saveUserTimezone } from "@/app/(dashboard)/[tenant]/settings/actions";
import { useEffect } from "react";

export function ReportTimezone() {
	useEffect(() => {
		const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		if (timeZone) {
			saveUserTimezone(timeZone);
		}
	}, []);

	return null;
}
