"use client";

import { saveUserTimezone } from "@/app/(dashboard)/[tenant]/settings/actions";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useEffect } from "react";

dayjs.extend(utc);
dayjs.extend(timezone);

export function ReportTimezone() {
	useEffect(() => {
		const timeZone = dayjs.tz.guess();
		if (timeZone) {
			console.log("Timezone: ", timeZone);
			saveUserTimezone(timeZone);
		}
	}, []);

	return null;
}
