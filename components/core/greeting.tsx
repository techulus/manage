export function Greeting({ timezone }: { timezone: string }) {
	const currentHour = new Date().toLocaleTimeString("en-US", {
		hour: "numeric",
		hour12: false,
		timeZone: timezone,
	});

	const hour = Number.parseInt(currentHour);
	const greeting =
		hour >= 5 && hour < 12
			? "Good morning 🌅"
			: hour >= 12 && hour < 18
				? "Good afternoon ☀️"
				: "Good evening 🌙";

	return <span className="font-semibold tracking-tighter">{greeting}</span>;
}
