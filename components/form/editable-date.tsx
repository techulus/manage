"use client";

import { toDateStringWithDay } from "@/lib/utils/date";
import { Check, ClockIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { DateTimePicker } from "../project/events/date-time-picker";

export default function EditableDate({
	value,
	timezone,
	onChange,
	label,
}: {
	value: Date | null | undefined;
	timezone: string;
	onChange: (value: Date | null) => Promise<void>;
	label: string;
}) {
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		if (isDeleting) {
			setTimeout(() => {
				setIsDeleting(false);
			}, 3000);
		}
	}, [isDeleting]);

	if (!value) {
		return (
			<div className="inline-block">
				<DateTimePicker
					dateOnly
					name="dueDate"
					placeholder={`Add ${label} date`}
					buttonClassName="text-muted-foreground border-none h-8 p-0 sm:p-2 shadow-none"
					onSelect={async (date) => {
						await onChange(date);
					}}
				/>
			</div>
		);
	}

	if (isDeleting) {
		return (
			<div className="flex flex-row items-center">
				<ClockIcon className="w-4 h-4" />
				<button
					type="button"
					className="outline-none hover:bg-destructive/40 p-1 px-2 rounded-md group flex items-center gap-1"
					onClick={async () => {
						await onChange(null);
						setIsDeleting(false);
					}}
				>
					<p>Confirm Delete</p>
					<Check className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ml-1.5" />
				</button>
			</div>
		);
	}

	return (
		<div className="flex flex-row items-center">
			<ClockIcon className="w-4 h-4" />
			<button
				type="button"
				className="outline-none hover:bg-destructive/40 p-1 px-2 rounded-md group flex items-center gap-1"
				onClick={() => setIsDeleting(true)}
			>
				<span suppressHydrationWarning className="text-primary font-semibold">
					{toDateStringWithDay(value, timezone)}
				</span>
				<TrashIcon className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ml-1.5" />
			</button>
		</div>
	);
}
