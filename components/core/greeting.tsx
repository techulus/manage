"use client";

import dayjs from "dayjs";
import { useEffect, useState } from "react";

export function Greeting() {
	const [greeting, setGreeting] = useState("");

	useEffect(() => {
		const getCurrentGreeting = () => {
			const currentHour = dayjs().hour();
			if (currentHour >= 5 && currentHour < 12) {
				return "Good morning";
			}
			if (currentHour >= 12 && currentHour < 18) {
				return "Good afternoon";
			}
			return "Good evening";
		};

		setGreeting(getCurrentGreeting());
	}, []);

	return <span>{greeting}</span>;
}
