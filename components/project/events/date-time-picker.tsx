"use client";

import { format } from "date-fns";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

type Props = {
	name: string;
	placeholder?: string;
	buttonClassName?: string;
	defaultValue?: Date | string;
	onSelect?: (date: Date) => void;
};

export function DateTimePicker(
	props: Props & {
		dateOnly?: boolean;
	},
) {
	return props.dateOnly ? <DatePicker {...props} /> : <TimePicker {...props} />;
}

function TimePicker(props: Props) {
	const [date, setDate] = React.useState<Date | undefined>(
		props.defaultValue ? new Date(props.defaultValue) : undefined,
	);
	const [isOpen, setIsOpen] = React.useState(false);

	const hours = Array.from({ length: 12 }, (_, i) => i + 1);
	const handleDateSelect = (selectedDate: Date | undefined) => {
		if (selectedDate) {
			setDate(selectedDate);
			props.onSelect?.(selectedDate);
		}
	};

	const handleTimeChange = (
		type: "hour" | "minute" | "ampm",
		value: string,
	) => {
		if (date) {
			const newDate = new Date(date);
			if (type === "hour") {
				newDate.setHours(
					(Number.parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0),
				);
			} else if (type === "minute") {
				newDate.setMinutes(Number.parseInt(value));
			} else if (type === "ampm") {
				const currentHours = newDate.getHours();
				newDate.setHours(
					value === "PM" ? currentHours + 12 : currentHours - 12,
				);
			}
			setDate(newDate);
		}
	};

	return (
		<>
			<input
				type="hidden"
				name={props.name}
				defaultValue={date?.toISOString()}
			/>
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"w-full justify-start text-left font-normal space-x-1",
							!date && "text-muted-foreground",
							props.buttonClassName,
						)}
					>
						<CalendarIcon className="h-4 w-4" />
						{date ? (
							format(date, "d MMM yyyy hh:mm aa")
						) : (
							<span>dd MMM yyyy hh:mm aa</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0">
					<div className="sm:flex">
						<Calendar
							mode="single"
							selected={date}
							onSelect={handleDateSelect}
							initialFocus
						/>
						<div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
							<ScrollArea className="w-64 sm:w-auto">
								<div className="flex sm:flex-col p-2">
									{hours.reverse().map((hour) => (
										<Button
											key={hour}
											size="icon"
											variant={
												date && date.getHours() % 12 === hour % 12
													? "default"
													: "ghost"
											}
											className="sm:w-full shrink-0 aspect-square"
											onClick={() => handleTimeChange("hour", hour.toString())}
										>
											{hour}
										</Button>
									))}
								</div>
								<ScrollBar orientation="horizontal" className="sm:hidden" />
							</ScrollArea>
							<ScrollArea className="w-64 sm:w-auto">
								<div className="flex sm:flex-col p-2">
									{Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
										<Button
											key={minute}
											size="icon"
											variant={
												date && date.getMinutes() === minute
													? "default"
													: "ghost"
											}
											className="sm:w-full shrink-0 aspect-square"
											onClick={() =>
												handleTimeChange("minute", minute.toString())
											}
										>
											{minute}
										</Button>
									))}
								</div>
								<ScrollBar orientation="horizontal" className="sm:hidden" />
							</ScrollArea>
							<ScrollArea className="">
								<div className="flex sm:flex-col p-2">
									{["AM", "PM"].map((ampm) => (
										<Button
											key={ampm}
											size="icon"
											variant={
												date &&
												((ampm === "AM" && date.getHours() < 12) ||
													(ampm === "PM" && date.getHours() >= 12))
													? "default"
													: "ghost"
											}
											className="sm:w-full shrink-0 aspect-square"
											onClick={() => handleTimeChange("ampm", ampm)}
										>
											{ampm}
										</Button>
									))}
								</div>
							</ScrollArea>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</>
	);
}

function DatePicker(props: Props) {
	const [date, setDate] = React.useState<Date | undefined>(
		props.defaultValue ? new Date(props.defaultValue) : undefined,
	);

	return (
		<>
			<input
				type="hidden"
				name={props.name}
				defaultValue={date?.toISOString()}
			/>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant={"outline"}
						className={cn(
							"w-full justify-start text-left font-normal space-x-1",
							!date && "text-muted-foreground",
							props.buttonClassName,
						)}
					>
						<CalendarIcon className="h-4 w-4" />
						{date ? (
							format(date, "PPP")
						) : (
							<span>{props.placeholder ?? "Pick a date"}</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={date}
						onSelect={(date) => {
							setDate(date);
							if (date) props.onSelect?.(date);
						}}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
		</>
	);
}
