"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { groupBy } from "es-toolkit";
import {
	AlertCircle,
	Calendar,
	CheckSquare,
	Clock,
	FileText,
	Filter,
	FolderOpen,
	RefreshCw,
	Search,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { HtmlPreview } from "@/components/core/html-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Panel } from "@/components/core/panel";

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
			return "bg-neutral-100 text-gray-800 dark:bg-neutral-900 dark:text-gray-200";
	}
};

interface SearchSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SearchSheet({ open, onOpenChange }: SearchSheetProps) {
	const router = useRouter();

	const [query, setQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState<
		"project" | "task" | "tasklist" | "event" | undefined
	>();
	const [projectFilter, setProjectFilter] = useState<number | undefined>();
	const [statusFilter, setStatusFilter] = useState<string | undefined>();
	const [debouncedQuery] = useDebounce(query, 300);

	const trpc = useTRPC();

	const {
		data: searchResults = [],
		isLoading,
		error,
	} = useQuery({
		...trpc.search.searchQuery.queryOptions({
			query: debouncedQuery,
			type: typeFilter,
			projectId: projectFilter,
			status: statusFilter,
			limit: 50,
		}),
		enabled: debouncedQuery.length > 0 && open,
	});

	// Fetch projects for project filter
	const { data: projects = [] } = useQuery(
		trpc.user.getProjects.queryOptions(),
	);

	const indexAllMutation = useMutation(
		trpc.search.indexAllContent.mutationOptions(),
	);

	const handleItemClick = (url: string) => {
		onOpenChange(false);
		router.push(url);
	};

	const handleReindexAll = async () => {
		try {
			const result = await indexAllMutation.mutateAsync();
			toast.success("Content reindexed successfully!", {
				description: `Indexed ${result.indexed.projects} projects, ${result.indexed.taskLists} task lists, ${result.indexed.tasks} tasks, and ${result.indexed.events} events.`,
			});
		} catch (err) {
			console.error("Error reindexing content:", err);
			toast.error("Failed to reindex content", {
				description:
					"Please try again or contact support if the problem persists.",
			});
		}
	};

	const clearFilter = useCallback(() => {
		setTypeFilter(undefined);
		setProjectFilter(undefined);
		setStatusFilter(undefined);
	}, []);

	const clearTypeFilter = () => setTypeFilter(undefined);
	const clearProjectFilter = () => setProjectFilter(undefined);
	const clearStatusFilter = () => setStatusFilter(undefined);

	// Get available statuses based on selected type
	const getAvailableStatuses = () => {
		switch (typeFilter) {
			case "project":
				return ["active", "archived"];
			case "task":
				return ["todo", "done"];
			case "tasklist":
				return ["active", "archived"];
			case "event":
				return []; // Events don't have status
			default:
				return ["active", "archived", "todo", "done"]; // All statuses
		}
	};

	const groupedResults = groupBy<
		SearchResult,
		"project" | "task" | "tasklist" | "event"
	>(searchResults, (item) => item.type);

	// Reset search when sheet closes
	useEffect(() => {
		if (!open) {
			setQuery("");
			clearFilter();
		}
	}, [open, clearFilter]);

	return (
		<Panel open={open} setOpen={onOpenChange} className="overflow-y-auto">
			<div className="p-6">
				<div className="flex items-start justify-between mb-6">
					<div>
						<h2 className="text-lg font-semibold">Search</h2>
						<p className="text-sm text-muted-foreground">
							Search across all your projects, tasks, events, and more
						</p>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => onOpenChange(false)}
						className="h-8 w-8"
					>
						<X className="h-4 w-4" />
						<span className="sr-only">Close</span>
					</Button>
				</div>

				<div className="space-y-6">
					{/* Search Input */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search projects, tasks, events..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="pl-10 pr-4 h-10"
							autoFocus
						/>
					</div>

					{/* Filters and Actions */}
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
						<div className="flex items-center gap-2 flex-wrap">
							{typeFilter && (
								<Badge variant="secondary" className="gap-1 p-1.5">
									{getTypeIcon(typeFilter)}
									{getTypeLabel(typeFilter)}
									<button
										type="button"
										onClick={clearTypeFilter}
										className="ml-1 hover:bg-muted rounded-full"
									>
										<X className="h-3 w-3" />
									</button>
								</Badge>
							)}
							{projectFilter && (
								<Badge variant="secondary" className="gap-1 p-1.5">
									<FolderOpen className="h-3 w-3" />
									{projects.find((p) => p.id === projectFilter)?.name ||
										"Project"}
									<button
										type="button"
										onClick={clearProjectFilter}
										className="ml-1 hover:bg-muted rounded-full"
									>
										<X className="h-3 w-3" />
									</button>
								</Badge>
							)}
							{statusFilter && (
								<Badge variant="secondary" className="gap-1 p-1.5">
									<CheckSquare className="h-3 w-3" />
									{statusFilter}
									<button
										type="button"
										onClick={clearStatusFilter}
										className="ml-1 hover:bg-muted rounded-full"
									>
										<X className="h-3 w-3" />
									</button>
								</Badge>
							)}
							{(typeFilter || projectFilter || statusFilter) && (
								<Button
									variant="ghost"
									size="sm"
									onClick={clearFilter}
									className="text-muted-foreground hover:text-foreground"
								>
									Clear all
								</Button>
							)}
							<div className="flex items-center gap-2 flex-wrap">
								{/* Type Filter */}
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="sm" className="gap-2">
											<Filter className="h-4 w-4" />
											Type
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="start">
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

								{/* Project Filter */}
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="sm" className="gap-2">
											<FolderOpen className="h-4 w-4" />
											Project
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="start"
										className="max-h-48 overflow-y-auto"
									>
										<DropdownMenuItem onClick={() => setProjectFilter(undefined)}>
											All Projects
										</DropdownMenuItem>
										{projects.map((project) => (
											<DropdownMenuItem
												key={project.id}
												onClick={() => setProjectFilter(project.id)}
											>
												<FolderOpen className="mr-2 h-4 w-4" />
												{project.name}
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>

								{/* Status Filter */}
								{getAvailableStatuses().length > 0 && (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="outline" size="sm" className="gap-2">
												<CheckSquare className="h-4 w-4" />
												Status
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="start">
											<DropdownMenuItem
												onClick={() => setStatusFilter(undefined)}
											>
												All Statuses
											</DropdownMenuItem>
											{getAvailableStatuses().map((status) => (
												<DropdownMenuItem
													key={status}
													onClick={() => setStatusFilter(status)}
												>
													<CheckSquare className="mr-2 h-4 w-4" />
													{status}
												</DropdownMenuItem>
											))}
										</DropdownMenuContent>
									</DropdownMenu>
								)}
							</div>
						</div>

						<Button
							variant="outline"
							size="sm"
							onClick={handleReindexAll}
							disabled={indexAllMutation.isPending}
							className="gap-2"
						>
							<RefreshCw
								className={cn(
									"h-4 w-4",
									indexAllMutation.isPending && "animate-spin",
								)}
							/>
							{indexAllMutation.isPending ? "Indexing..." : "Reindex All"}
						</Button>
					</div>

					{/* Results */}
					<div className="space-y-4">
						{debouncedQuery.length === 0 ? (
							<div className="border rounded-lg p-8">
								<div className="flex flex-col items-center justify-center text-center">
									<Search className="h-12 w-12 text-muted-foreground mb-4" />
									<h3 className="text-xl font-semibold mb-2">Start searching</h3>
									<p className="text-muted-foreground max-w-md">
										Type in the search box above to find projects, tasks, events,
										and more across your workspace.
									</p>
								</div>
							</div>
						) : isLoading ? (
							<div className="border rounded-lg p-8">
								<div className="flex items-center justify-center">
									<RefreshCw className="h-6 w-6 animate-spin mr-2" />
									<span>Searching...</span>
								</div>
							</div>
						) : error ? (
							<div className="border rounded-lg p-8">
								<div className="flex flex-col items-center justify-center text-center">
									<AlertCircle className="h-12 w-12 text-destructive mb-4" />
									<h3 className="text-xl font-semibold mb-2">Search Error</h3>
									<p className="text-muted-foreground max-w-md">
										There was an error performing your search. Please try again or
										reindex your content.
									</p>
								</div>
							</div>
						) : searchResults.length === 0 ? (
							<div className="border rounded-lg p-8">
								<div className="flex flex-col items-center justify-center text-center">
									<Search className="h-12 w-12 text-muted-foreground mb-4" />
									<h3 className="text-xl font-semibold mb-2">No results found</h3>
									<p className="text-muted-foreground max-w-md">
										No results found for "{debouncedQuery}". Try different
										keywords or check your spelling.
									</p>
								</div>
							</div>
						) : (
							<div className="space-y-6">
								<div className="text-sm text-muted-foreground">
									Found {searchResults.length} result
									{searchResults.length !== 1 ? "s" : ""} for "{debouncedQuery}"
								</div>

								{["project", "tasklist", "task", "event"].map((type) => {
									const results =
										groupedResults[type as keyof typeof groupedResults];
									if (!results || results.length === 0) return null;

									return (
										<div key={type} className="space-y-3">
											<div className="flex items-center gap-2">
												{getTypeIcon(type)}
												<h3 className="text-lg font-semibold">
													{getTypeLabel(type)}s ({results.length})
												</h3>
											</div>
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
												{results.map((result) => (
													<button
														key={result.id}
														className="border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer text-left w-full"
														onClick={() => handleItemClick(result.url)}
														type="button"
													>
														<div className="space-y-2">
															<div className="flex items-center gap-2 min-w-0">
																{getTypeIcon(result.type)}
																<h4 className="font-medium truncate">
																	{result.title}
																</h4>
																{result.status && (
																	<Badge
																		variant="secondary"
																		className={cn(
																			"text-xs px-2 py-0",
																			getStatusColor(result.status),
																		)}
																	>
																		{result.status.toUpperCase()}
																	</Badge>
																)}
															</div>
															{result.description && (
																<div className="text-sm text-muted-foreground line-clamp-2">
																	<HtmlPreview content={result.description} />
																</div>
															)}
															<div className="flex items-center gap-4 text-xs text-muted-foreground">
																{result.projectName &&
																	result.type !== "project" && (
																		<div className="flex items-center gap-1">
																			<FolderOpen className="h-3 w-3" />
																			{result.projectName}
																		</div>
																	)}
																{result.dueDate && (
																	<div className="flex items-center gap-1">
																		<Clock className="h-3 w-3" />
																		Due {result.dueDate.toLocaleDateString()}
																	</div>
																)}
																<div className="flex items-center gap-1">
																	Created {result.createdAt.toLocaleDateString()}
																</div>
															</div>
														</div>
													</button>
												))}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</div>
		</Panel>
	);
}