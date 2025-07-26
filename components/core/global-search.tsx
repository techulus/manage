"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { 
	Search, 
	FileText, 
	CheckSquare, 
	Calendar, 
	FolderOpen,
	Filter,
	X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { Button } from "../ui/button";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "../ui/command";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchResult {
	id: string;
	title: string;
	description?: string;
	type: "project" | "task" | "tasklist" | "event";
	status?: string;
	projectName?: string;
	url: string;
	projectId?: number;
	score: number;
	createdAt: Date;
	dueDate?: Date;
}

const getTypeIcon = (type: string) => {
	switch (type) {
		case "project":
			return <FolderOpen className="h-4 w-4" />;
		case "task":
			return <CheckSquare className="h-4 w-4" />;
		case "tasklist":
			return <FileText className="h-4 w-4" />;
		case "event":
			return <Calendar className="h-4 w-4" />;
		default:
			return <Search className="h-4 w-4" />;
	}
};

const getTypeLabel = (type: string) => {
	switch (type) {
		case "project":
			return "Project";
		case "task":
			return "Task";
		case "tasklist":
			return "Task List";
		case "event":
			return "Event";
		default:
			return type;
	}
};

const getStatusColor = (status?: string) => {
	switch (status?.toLowerCase()) {
		case "active":
		case "in_progress":
			return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
		case "completed":
		case "done":
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
		case "paused":
		case "on_hold":
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
		case "cancelled":
		case "archived":
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
	}
};

export function GlobalSearch({
	tenant,
	projectId,
}: { 
	tenant: string; 
	projectId?: number;
}) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState<"project" | "task" | "tasklist" | "event" | undefined>();
	const [debouncedQuery] = useDebounce(query, 300);
	const router = useRouter();

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	const trpc = useTRPC();
	
	const { data: searchResults = [], isLoading } = useQuery(
		trpc.search.searchQuery.queryOptions({
			query: debouncedQuery,
			type: typeFilter,
			projectId: typeFilter ? projectId : undefined,
			limit: 20,
		}, {
			enabled: debouncedQuery.length > 0,
		})
	);

	const handleItemSelect = (url: string) => {
		router.push(url);
		setOpen(false);
		setQuery("");
		setTypeFilter(undefined);
	};

	const clearFilter = () => {
		setTypeFilter(undefined);
	};

	return (
		<>
			<Button
				variant="outline"
				className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
				onClick={() => setOpen(true)}
			>
				<Search className="h-4 w-4 xl:mr-2" />
				<span className="hidden xl:inline-flex">Search everything...</span>
				<kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
					<span className="text-xs">⌘</span>/
				</kbd>
			</Button>

			<CommandDialog open={open} onOpenChange={setOpen}>
				<div className="flex items-center border-b px-3">
					<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
					<CommandInput 
						placeholder="Search projects, tasks, events..." 
						value={query}
						onValueChange={setQuery}
						className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
					/>
					<div className="flex items-center gap-2 ml-2">
						{typeFilter && (
							<Badge variant="secondary" className="gap-1">
								{getTypeIcon(typeFilter)}
								{getTypeLabel(typeFilter)}
								<button type="button" onClick={clearFilter} className="ml-1 hover:bg-muted rounded-full">
									<X className="h-3 w-3" />
								</button>
							</Badge>
						)}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm" className="h-8 px-2">
									<Filter className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => setTypeFilter(undefined)}>
									All Types
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTypeFilter("project")}>
									<FolderOpen className="mr-2 h-4 w-4" />
									Projects
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTypeFilter("task")}>
									<CheckSquare className="mr-2 h-4 w-4" />
									Tasks
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTypeFilter("tasklist")}>
									<FileText className="mr-2 h-4 w-4" />
									Task Lists
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTypeFilter("event")}>
									<Calendar className="mr-2 h-4 w-4" />
									Events
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
				<CommandList className="max-h-[400px] overflow-y-auto">
					{debouncedQuery.length === 0 ? (
						<div className="py-6 text-center text-sm text-muted-foreground">
							<Search className="mx-auto h-6 w-6 mb-2 opacity-50" />
							Type to search across all your projects, tasks, and events
						</div>
					) : isLoading ? (
						<div className="py-6 text-center text-sm text-muted-foreground">
							Searching...
						</div>
					) : searchResults.length === 0 ? (
						<CommandEmpty>
							<div className="py-6 text-center">
								<Search className="mx-auto h-6 w-6 mb-2 opacity-50" />
								<p className="text-sm text-muted-foreground">No results found.</p>
								<p className="text-xs text-muted-foreground mt-1">
									Try different keywords or check your spelling.
								</p>
							</div>
						</CommandEmpty>
					) : (
						<>
							{["project", "tasklist", "task", "event"].map(type => {
								const filteredResults = searchResults.filter(result => result.type === type);
								if (filteredResults.length === 0) return null;

								return (
									<CommandGroup key={type} heading={`${getTypeLabel(type)}s`}>
										{filteredResults.map((result) => (
											<CommandItem
												key={result.id}
												onSelect={() => handleItemSelect(result.url)}
												className="flex items-center gap-3 p-3 cursor-pointer"
											>
												<div className="flex items-center gap-2 min-w-0 flex-1">
													{getTypeIcon(result.type)}
													<div className="min-w-0 flex-1">
														<div className="flex items-center gap-2 mb-1">
															<span className="font-medium truncate">{result.title}</span>
															{result.status && (
																<Badge 
																	variant="secondary" 
																	className={cn("text-xs px-2 py-0", getStatusColor(result.status))}
																>
																	{result.status}
																</Badge>
															)}
														</div>
														{result.description && (
															<p className="text-sm text-muted-foreground truncate">
																{result.description}
															</p>
														)}
														<div className="flex items-center gap-2 mt-1">
															{result.projectName && result.type !== "project" && (
																<Badge variant="outline" className="text-xs">
																	{result.projectName}
																</Badge>
															)}
															{result.dueDate && (
																<span className="text-xs text-muted-foreground">
																	Due {result.dueDate.toLocaleDateString()}
																</span>
															)}
														</div>
													</div>
												</div>
											</CommandItem>
										))}
									</CommandGroup>
								);
							})}
						</>
					)}
				</CommandList>
			</CommandDialog>
		</>
	);
}