"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { parseAsBoolean, useQueryState } from "nuqs";
import { type Dispatch, memo, type SetStateAction, useState } from "react";
import { type Frequency, RRule, rrulestr } from "rrule";
import { Input } from "@/components/ui/input";
import type { EventWithCreator } from "@/drizzle/types";
import { toStartOfHour } from "@/lib/utils/date";
import { displayMutationError } from "@/lib/utils/error";
import { useTRPC } from "@/trpc/client";
import Editor from "../editor";
import { DateTimePicker } from "../project/events/date-time-picker";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { SaveButton } from "./button";

const EventForm = memo(
	({
		item,
		setEditing,
	}: {
		item?: EventWithCreator;
		setEditing?: Dispatch<SetStateAction<number | null>>;
	}) => {
		const { projectId } = useParams();

		const [_, setCreate] = useQueryState(
			"create",
			parseAsBoolean.withDefault(false),
		);

		const trpc = useTRPC();
		const queryClient = useQueryClient();
		const upsertEvent = useMutation(
			trpc.events.upsert.mutationOptions({
				onSuccess: (event) => {
					setCreate(null);
					setEditing?.(null);
					queryClient.invalidateQueries({
						queryKey: trpc.events.getByDate.queryKey({
							date: event.start,
							projectId: +projectId!,
						}),
					});
					queryClient.invalidateQueries({
						queryKey: trpc.events.getByWeek.queryKey({
							projectId: +projectId!,
						}),
					});
					queryClient.invalidateQueries({
						queryKey: trpc.events.getByMonth.queryKey({
							projectId: +projectId!,
							date: event.start,
						}),
					});
					queryClient.invalidateQueries({
						queryKey: trpc.user.getTodayData.queryKey(),
					});
				},
				onError: displayMutationError,
			}),
		);

		const [name, setName] = useState(item?.name ?? "");
		const [start, setStart] = useState(
			toStartOfHour(item?.start ?? new Date(new Date())),
		);
		const [end, setEnd] = useState(item?.end ?? undefined);
		const [allDay, setAllDay] = useState(item?.allDay ?? false);
		const [repeat, setRepeat] = useState<Frequency | -1>(
			item?.repeatRule ? rrulestr(item.repeatRule).options.freq : -1,
		);
		const [repeatUntil, setRepeatUntil] = useState<Date | null>(
			item?.repeatRule ? rrulestr(item.repeatRule).options.until : null,
		);

		return (
			<form
				className="flex-1 overflow-hidden overflow-y-auto"
				action={(formData: FormData) => {
					upsertEvent.mutate({
						name,
						start,
						end,
						allDay,
						projectId: +projectId!,
						id: item?.id ?? undefined,
						repeat: repeat === -1 ? undefined : repeat,
						repeatUntil: repeat !== -1 ? repeatUntil : undefined,
						description: formData.get("description") as string,
					});
				}}
			>
				<div className="px-6 space-y-6">
					<div className="space-y-2">
						<label
							htmlFor="name"
							className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5 lg:text-left"
						>
							Name
						</label>
						<div className="mt-2 sm:col-span-2 sm:mt-0">
							<Input
								type="text"
								name="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
					</div>

					<div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 border rounded-md p-4 pb-8">
						<div className="flex flex-col space-y-2">
							<Label>Start</Label>
							<DateTimePicker
								name="start"
								defaultValue={start.toISOString()}
								dateOnly={allDay}
								onSelect={(date) => setStart(date)}
							/>
						</div>
						<div className="flex flex-col space-y-2">
							<Label>End</Label>
							<DateTimePicker
								name="end"
								defaultValue={end?.toISOString()}
								dateOnly={allDay}
								onSelect={(date) => setEnd(date)}
							/>
						</div>

						<Label
							htmlFor="all-day"
							className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/50 dark:bg-background/80 px-3"
						>
							<Switch
								name="allDay"
								id="all-day"
								aria-label="All day event"
								defaultChecked={item?.allDay ?? false}
								onCheckedChange={(checked) => setAllDay(checked)}
							/>
							All Day Event
						</Label>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4">
						<div className="flex flex-col space-y-2">
							<Label htmlFor="repeat">Repeat</Label>
							<Select
								name="repeat"
								value={repeat ? String(repeat) : undefined}
								onValueChange={(value) => setRepeat(+value as Frequency)}
							>
								<SelectTrigger id="repeat">
									<SelectValue placeholder="Select repeat option" />
								</SelectTrigger>
								<SelectContent position="popper">
									<SelectItem value={String("-1")}>None</SelectItem>
									<SelectItem value={String(RRule.DAILY)}>Daily</SelectItem>
									<SelectItem value={String(RRule.WEEKLY)}>Weekly</SelectItem>
									<SelectItem value={String(RRule.MONTHLY)}>Monthly</SelectItem>
									<SelectItem value={String(RRule.YEARLY)}>Yearly</SelectItem>
								</SelectContent>
							</Select>
						</div>
						{repeat !== -1 && (
							<div className="flex flex-col space-y-2">
								<Label>Until</Label>
								<DateTimePicker
									name="repeatUntil"
									defaultValue={repeatUntil?.toISOString()}
									dateOnly
									onSelect={(date) => setRepeatUntil(date)}
								/>
							</div>
						)}
					</div>

					<div className="space-y-2">
						<label
							htmlFor="htmlContent"
							className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5 lg:text-left"
						>
							Notes
						</label>
						<div className="mt-2 sm:col-span-2 sm:mt-0">
							<Editor
								defaultValue={item?.description ?? ""}
								name="description"
								allowImageUpload={false}
							/>
						</div>
					</div>
				</div>
				<div className="ml-auto flex items-center justify-end gap-x-6 p-4">
					<Button
						type="button"
						variant="ghost"
						onClick={() => {
							setCreate(null);
							setEditing?.(null);
						}}
					>
						Cancel
					</Button>
					<SaveButton label={item ? "Update" : "Create"} />
				</div>
			</form>
		);
	},
);

export default EventForm;
