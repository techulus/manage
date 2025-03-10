"use client";

import {
	createEvent,
	updateEvent,
} from "@/app/(dashboard)/[tenant]/projects/[projectId]/events/actions";
import { Input } from "@/components/ui/input";
import type { EventWithInvites, User } from "@/drizzle/types";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { RRule, rrulestr } from "rrule";
import { toast } from "sonner";
import MarkdownEditor from "../editor";
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
	on,
	users,
	projectId,
}: {
	item?: EventWithInvites | null;
	projectId: string;
	on?: string;
	users: User[];
}) {
	const router = useRouter();
	const [state, formAction] = useActionState(
		item ? updateEvent : createEvent,
		null,
	);

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

	useEffect(() => {
		if (state?.message) {
			toast.error(state.message);
		}
	}, [state]);

	return (
		<form action={formAction}>
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
							htmlFor="markdownContent"
							className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5 lg:text-left"
						>
							Description
						</label>
						<div className="mt-2 sm:col-span-2 sm:mt-0">
							<MarkdownEditor
								defaultValue={item?.description ?? ""}
								name="description"
								compact
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
