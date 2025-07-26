"use client";

import { HtmlPreview } from "@/components/core/html-view";
import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
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
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";

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

export default function SearchPage() {
	const params = useParams();
	const router = useRouter();
	const searchParams = useSearchParams();
	const tenant = params.tenant as string;

	const [query, setQuery] = useState(searchParams.get("q") || "");
	const [typeFilter, setTypeFilter] = useState<
		"project" | "task" | "tasklist" | "event" | undefined
	>();
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
			limit: 50,
		}),
		enabled: debouncedQuery.length > 0,
	});

	const indexAllMutation = useMutation(
		trpc.search.indexAllContent.mutationOptions(),
	);

	// Update URL when query changes
	useEffect(() => {
		const params = new URLSearchParams();
		if (query) {
			params.set("q", query);
		}
		const newUrl = `/${tenant}/search${params.toString() ? `?${params.toString()}` : ""}`;
		router.replace(newUrl, { scroll: false });
	}, [query, tenant, router]);

	const handleItemClick = (url: string) => {
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
				description: "Please try again or contact support if the problem persists.",
			});
		}
	};

	const clearFilter = () => {
		setTypeFilter(undefined);
	};

	const groupedResults = searchResults.reduce(
		(acc, result) => {
			if (!acc[result.type]) {
				acc[result.type] = [];
			}
			acc[result.type].push(result);
			return acc;
		},
		{} as Record<string, SearchResult[]>,
	);

	return (
		<>
			<PageTitle title="Search">
				<p className="text-muted-foreground">
					Search across all your projects, tasks, events, and more
				</p>
			</PageTitle>

			<PageSection className="space-y-6" transparent>
				{/* Search Input */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search projects, tasks, events..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="pl-10 pr-4 h-12 text-lg"
					/>
				</div>

				{/* Filters and Actions */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{typeFilter && (
							<Badge variant="secondary" className="gap-1 p-1.5">
								{getTypeIcon(typeFilter)}
								{getTypeLabel(typeFilter)}
								<button
									type="button"
									onClick={clearFilter}
									className="ml-1 hover:bg-muted rounded-full"
								>
									<X className="h-3 w-3" />
								</button>
							</Badge>
						)}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="gap-2">
									<Filter className="h-4 w-4" />
									Filter
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
								const results = groupedResults[type];
								if (!results || results.length === 0) return null;

								return (
									<div key={type} className="space-y-3">
										<div className="flex items-center gap-2">
											{getTypeIcon(type)}
											<h3 className="text-lg font-semibold">
												{getTypeLabel(type)}s ({results.length})
											</h3>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
											{results.map((result) => (
												<div
													key={result.id}
													className="border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
													onClick={() => handleItemClick(result.url)}
													onKeyDown={(e) => {
														if (e.key === "Enter" || e.key === " ") {
															handleItemClick(result.url);
														}
													}}
													role="button"
													tabIndex={0}
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
																	{result.status}
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
												</div>
											))}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>

			</PageSection>
		</>
	);
}
