"use client";

import { toDateStringWithDay } from "@/lib/utils/date";
import { ClockIcon, Edit } from "lucide-react";
import { useState } from "react";
import { DateTimePicker } from "../project/events/date-time-picker";

export default function EditableDate({
	value,
	timezone,
	onChange,
	label,
}: {
	value: Date | null | undefined;
	timezone: string;
	onChange: (value: Date) => Promise<void>;
	label: string;
}) {
	const [isEditing, setIsEditing] = useState(false);

	if (isEditing) {
		return (
			<div className="flex flex-row items-center space-x-2">
				<ClockIcon className="w-4 h-4" />
				<DateTimePicker
					dateOnly
					name="dueDate"
					onSelect={async (date) => {
						await onChange(date);
						setIsEditing(false);
					}}
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-row items-center">
			<ClockIcon className="w-4 h-4" />
			<button
				type="button"
				className="outline-none hover:bg-muted p-1 px-2 rounded-md group flex items-center gap-1"
				onClick={() => setIsEditing(true)}
			>
				<span suppressHydrationWarning>
					{value ? toDateStringWithDay(value, timezone) : `No ${label} date`}
				</span>
				<Edit className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ml-1.5" />
			</button>
		</div>
	);
}
