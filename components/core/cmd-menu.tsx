"use client";

import { useQueries } from "@tanstack/react-query";
import { Calendar, Menu, Plus, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/client";
import { Button } from "../ui/button";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "../ui/command";

export function CommandMenu({
	tenant,
	projectId,
}: {
	tenant: string;
	projectId: number;
}) {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	const trpc = useTRPC();
	const [{ data: projectsData }, { data: tasklists = [] }] = useQueries({
		queries: [
			trpc.user.getProjects.queryOptions({
				statuses: ["active"],
			}),
			{
				...trpc.tasks.getTaskLists.queryOptions({
					projectId: +projectId!,
				}),
				enabled: !!projectId,
			},
		],
	});

	const projects = projectsData?.projects ?? [];

	return (
		<>
			<Button
				className="fixed h-12 w-12 bottom-10 right-6 z-50 rounded-full shadow-lg md:hidden flex items-center justify-center"
				onClick={() => setOpen(true)}
				aria-label="Open command menu"
				type="button"
			>
				<Menu />
			</Button>
			<CommandDialog open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Type a command or search..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Navigation">
						<CommandItem
							onSelect={() => {
								router.push(`/${tenant}/today`);
								setOpen(false);
							}}
						>
							<Calendar />
							<span>Today</span>
						</CommandItem>
						<CommandItem
							onSelect={() => {
								router.push(`/${tenant}/settings`);
								setOpen(false);
							}}
						>
							<Settings />
							<span>Settings</span>
						</CommandItem>
					</CommandGroup>
					<CommandGroup heading="Projects">
						{projects.map((project) => (
							<CommandItem
								key={project.id}
								onSelect={() => {
									router.push(`/${tenant}/projects/${project.id}`);
									setOpen(false);
								}}
							>
								{project.name}
							</CommandItem>
						))}
					</CommandGroup>
					<CommandGroup heading="Tasklists">
						{tasklists.map((tasklist) => (
							<CommandItem
								key={tasklist.id}
								onSelect={() => {
									router.push(
										`/${tenant}/projects/${projectId}/tasklists/${tasklist.id}`,
									);
									setOpen(false);
								}}
							>
								{tasklist.name}
							</CommandItem>
						))}
						<CommandItem
							onSelect={() => {
								router.push(
									`/${tenant}/projects/${projectId}/tasklists?create=true`,
								);
								setOpen(false);
							}}
						>
							<Plus />
							Create new tasks list
						</CommandItem>
					</CommandGroup>
					<CommandGroup heading="Events">
						<CommandItem
							onSelect={() => {
								router.push(
									`/${tenant}/projects/${projectId}/events?create=true`,
								);
								setOpen(false);
							}}
						>
							<Plus />
							Create new event
						</CommandItem>
					</CommandGroup>
				</CommandList>
			</CommandDialog>
		</>
	);
}
