"use client";

import { Input } from "@/components/ui/input";
import type { EventWithInvites } from "@/drizzle/types";
import { toMachineDateString } from "@/lib/utils/date";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { Trash2Icon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { type Frequency, RRule, rrulestr } from "rrule";
import Editor from "../editor";
import { DateTimePicker } from "../project/events/date-time-picker";
import { Assignee } from "../project/shared/assigee";
import { MultiUserSelect } from "../project/shared/multi-user-select";
import { Button } from "../ui/button";
import { CardContent, CardFooter } from "../ui/card";
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

export default function EventForm({
	item,
}: {
	item?: EventWithInvites | null;
}) {
	const { projectId, tenant } = useParams();
	const [on] = useQueryState("on");
	const router = useRouter();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const upsertEvent = useMutation(trpc.events.upsert.mutationOptions());

	const [{ data: timezone }, { data: users = [] }] = useQueries({
		queries: [
			trpc.settings.getTimezone.queryOptions(),
			trpc.settings.getAllUsers.queryOptions(),
		],
	});

	const [allDay, setAllDay] = useState(item?.allDay ?? false);
	const [invites, setInvites] = useState<string[]>(
		item?.invites?.map((invite) => invite.userId) ?? [],
	);

	const end = item?.end ? new Date(item.end) : undefined;
	const rrule = item?.repeatRule ? rrulestr(item.repeatRule) : null;

	let start: Date;
	start = item?.start ? new Date(item.start) : new Date();
	if (on) {
		const date = new Date(on);
		start = new Date(date.setHours(start.getHours(), start.getMinutes()));
	}

	return (
		<form
			action={async (formData: FormData) => {
				const event = await upsertEvent.mutateAsync({
					name: formData.get("name") as string,
					start: new Date(formData.get("start") as string),
					allDay: formData.get("allDay") === "on",
					projectId: +(formData.get("projectId") as string),
					id: +(formData.get("id") as string),
					repeat: formData.get("repeat")
						? (Number(formData.get("repeat")) as Frequency)
						: undefined,
					description: formData.get("description") as string,
					end: formData.get("end")
						? new Date(formData.get("end") as string)
						: undefined,
					invites: formData.get("invites")
						? (formData.get("invites") as string).split(",")
						: [],
					repeatUntil: formData.get("repeatUntil")
						? new Date(formData.get("repeatUntil") as string)
						: undefined,
				});

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

				router.push(
					`/${tenant}/projects/${projectId}/events?on=${toMachineDateString(event.start, timezone!)}`,
				);
			}}
		>
			<CardContent>
				<div className="my-2 space-y-4">
					{item ? (
						<input type="hidden" name="id" defaultValue={item.id} />
					) : null}
					<input type="hidden" name="projectId" defaultValue={projectId} />
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

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="flex flex-col space-y-2">
							<Label>Start</Label>
							<DateTimePicker
								name="start"
								defaultValue={start.toISOString()}
								dateOnly={allDay}
							/>
						</div>
						<div className="flex flex-col space-y-2">
							<Label>End</Label>
							<DateTimePicker
								name="end"
								defaultValue={end?.toISOString()}
								dateOnly={allDay}
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="flex flex-col justify-center space-y-2">
							<Label htmlFor="all-day" className="flex items-center gap-2">
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
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="flex flex-col space-y-2">
							<Label htmlFor="repeat">Repeat</Label>
							<Select
								name="repeat"
								defaultValue={
									rrule?.options.freq ? String(rrule?.options.freq) : undefined
								}
							>
								<SelectTrigger id="repeat">
									<SelectValue placeholder="Select repeat option" />
								</SelectTrigger>
								<SelectContent position="popper">
									<SelectItem value={String(RRule.DAILY)}>Daily</SelectItem>
									<SelectItem value={String(RRule.WEEKLY)}>Weekly</SelectItem>
									<SelectItem value={String(RRule.MONTHLY)}>Monthly</SelectItem>
									<SelectItem value={String(RRule.YEARLY)}>Yearly</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col space-y-2">
							<Label>Until</Label>
							<DateTimePicker name="repeatUntil" dateOnly />
						</div>
					</div>

					{users.length ? (
						<div className="space-y-2">
							<label
								htmlFor="invite"
								className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5 lg:text-left"
							>
								Invite
							</label>
							<div className="mt-2 sm:col-span-2 sm:mt-0">
								<input type="hidden" name="invites" value={invites.join(",")} />
								{invites.length ? (
									<div className="mb-2 flex space-x-2">
										{invites.map((userId) => (
											<div key={userId} className="flex items-center">
												<Assignee
													user={users.find((user) => user.id === userId)!}
												/>
												<Button
													variant="link"
													size="sm"
													onClick={() => {
														setInvites((invites) => [
															...invites.filter((x) => x !== userId),
														]);
													}}
												>
													<Trash2Icon className="h-5 w-5" />
												</Button>
											</div>
										))}
									</div>
								) : null}

								{users.filter((user) => !invites.includes(user.id)).length ? (
									<MultiUserSelect
										users={users}
										onUpdate={(userId) => {
											setInvites((invites) => [...invites, userId]);
										}}
									/>
								) : null}
							</div>
						</div>
					) : null}

					<div className="space-y-2">
						<label
							htmlFor="htmlContent"
							className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5 lg:text-left"
						>
							Description
						</label>
						<div className="mt-2 sm:col-span-2 sm:mt-0">
							<Editor
								defaultValue={item?.description ?? ""}
								name="description"
							/>
						</div>
					</div>
				</div>
			</CardContent>
			<CardFooter>
				<div className="ml-auto flex items-center justify-end gap-x-6">
					<Button
						type="button"
						variant="ghost"
						onClick={(evt) => {
							evt.preventDefault();
							evt.stopPropagation();
							router.back();
						}}
					>
						Cancel
					</Button>
					<SaveButton />
				</div>
			</CardFooter>
		</form>
	);
}
