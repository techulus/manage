"use client";

import { Input } from "@/components/ui/input";
import type { Project, TaskList } from "@/drizzle/types";
import Editor from "../editor";
import { DateTimePicker } from "../project/events/date-time-picker";

export default function SharedForm({
	item,
	showDueDate = true,
}: {
	item?: Project | TaskList | null;
	showDueDate?: boolean;
}) {
	return (
		<div className="my-2 space-y-4">
			<div className="space-y-2">
				<label
					htmlFor="name"
					className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5 lg:text-left"
				>
					Name
				</label>
				<div className="mt-2 sm:col-span-2 sm:mt-0">
					<Input type="text" name="name" defaultValue={item?.name ?? ""} />
				</div>
			</div>

			<div className="space-y-2">
				<label
					htmlFor="description"
					className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5 lg:text-left"
				>
					Notes
				</label>
				<div className="mt-2 sm:col-span-2 sm:mt-0">
					<Editor
						defaultValue={item?.description ?? ""}
						allowImageUpload={false}
					/>
				</div>
			</div>

			{showDueDate ? (
				<div className="py-2 sm:grid sm:grid-cols-3 sm:items-start sm:gap-4">
					<label
						htmlFor="description"
						className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5 lg:text-left"
					>
						Due on
					</label>
					<div className="mt-2 max-w-xs sm:col-span-2 sm:mt-0">
						<DateTimePicker
							name="dueDate"
							// @ts-ignore
							defaultValue={item?.dueDate}
							dateOnly
						/>
					</div>
				</div>
			) : null}
		</div>
	);
}
