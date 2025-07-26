"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { User } from "@/drizzle/types";
import { cn } from "@/lib/utils";
import { UserBadge } from "./user-badge";

export function AssignToUser({
	users = [],
	onUpdate,
}: {
	users: User[];
	onUpdate: (userId: string) => void;
}) {
	const [isAssigning, setIsAssigning] = useState(false);
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState("");

	const assignedTo = useMemo(() => {
		const user = users.find((user) => user.id === value);
		return value ? (user?.firstName ?? user?.email ?? "-") : "Select user...";
	}, [value, users]);

	if (!isAssigning) {
		return (
			<Button
				size="sm"
				variant="outline"
				className="mr-4"
				onClick={async () => {
					setIsAssigning(true);
				}}
			>
				Assign
			</Button>
		);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					aria-expanded={open}
					className="w-[200px] justify-between"
				>
					{assignedTo}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput placeholder="Search user..." />
					<CommandEmpty>No user found.</CommandEmpty>
					<CommandGroup>
						{users.map((user: User) => (
							<CommandItem
								key={user.id}
								value={user.id}
								onSelect={async (currentValue) => {
									onUpdate(currentValue);
									setValue(currentValue);
									setOpen(false);
									setIsAssigning(false);
								}}
							>
								<Check
									className={cn(
										"mr-2 h-4 w-4",
										value === user.id ? "opacity-100" : "opacity-0",
									)}
								/>
								<UserBadge user={user} />
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
