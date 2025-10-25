"use client";

import { Title } from "@radix-ui/react-dialog";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { format, isSameDay, startOfDay } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import EmptyState from "@/components/core/empty-state";
import { Panel } from "@/components/core/panel";
import PageSection from "@/components/core/section";
import PostForm from "@/components/form/post";
import PageTitle from "@/components/layout/page-title";
import PostsList from "@/components/project/posts/posts-list";
import { buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC, useTRPCClient } from "@/trpc/client";

const POSTS_LIMIT = 5;

export default function Posts() {
	const { projectId, tenant } = useParams();
	const [create, setCreate] = useQueryState(
		"create",
		parseAsBoolean.withDefault(false),
	);
	const [activeTab, setActiveTab] = useState("published");
	const [categoryFilter, setCategoryFilter] = useQueryState(
		"category",
		parseAsString.withDefault("all"),
	);
	const [authorFilter, setAuthorFilter] = useQueryState(
		"author",
		parseAsString.withDefault("all"),
	);
	const [dateFilter, setDateFilter] = useQueryState(
		"date",
		parseAsString.withDefault(""),
	);

	const trpc = useTRPC();
	const trpcClient = useTRPCClient();

	const { data: project } = useQuery(
		trpc.projects.getProjectById.queryOptions({
			id: +projectId!,
		}),
	);

	const {
		data: publishedData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: [
			["posts", "list"],
			{ input: { projectId: +projectId!, limit: POSTS_LIMIT }, type: "query" },
		],
		queryFn: async ({ pageParam }) => {
			return await trpcClient.posts.list.query({
				projectId: +projectId!,
				limit: POSTS_LIMIT,
				offset: pageParam,
			});
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (lastPage.length < POSTS_LIMIT) return undefined;
			return allPages.length * POSTS_LIMIT;
		},
		enabled: activeTab === "published",
	});

	const allPublishedPosts = publishedData?.pages.flat() ?? [];

	const { data: myDrafts = [] } = useQuery({
		...trpc.posts.myDrafts.queryOptions({
			projectId: +projectId!,
		}),
		enabled: activeTab === "drafts",
	});

	const uniqueAuthors = useMemo(() => {
		const posts = activeTab === "published" ? allPublishedPosts : myDrafts;
		const authorsMap = new Map();
		posts.forEach((post) => {
			if (!authorsMap.has(post.createdByUser)) {
				authorsMap.set(post.createdByUser, {
					id: post.creator.id,
					name: `${post.creator.firstName || ""} ${post.creator.lastName || ""}`.trim(),
				});
			}
		});
		return Array.from(authorsMap.values());
	}, [allPublishedPosts, myDrafts, activeTab]);

	const displayedPosts = useMemo(() => {
		const posts = activeTab === "published" ? allPublishedPosts : myDrafts;
		return posts.filter((post) => {
			const categoryMatch =
				categoryFilter === "all" || post.category === categoryFilter;
			const authorMatch =
				authorFilter === "all" || post.createdByUser === authorFilter;

			let dateMatch = true;
			if (dateFilter) {
				const filterDate = startOfDay(new Date(dateFilter));
				const postDate = startOfDay(
					new Date(post.publishedAt || post.updatedAt),
				);
				dateMatch = isSameDay(filterDate, postDate);
			}

			return categoryMatch && authorMatch && dateMatch;
		});
	}, [
		allPublishedPosts,
		myDrafts,
		activeTab,
		categoryFilter,
		authorFilter,
		dateFilter,
	]);

	return (
		<>
			<PageTitle
				title="Posts"
				actions={
					project?.canEdit ? (
						<Link
							href={`/${tenant}/projects/${projectId}/posts?create=true`}
							className={buttonVariants()}
						>
							New
						</Link>
					) : undefined
				}
			/>

			<PageSection transparent>
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="mb-4">
						<TabsTrigger value="published">Published</TabsTrigger>
						<TabsTrigger value="drafts">My Drafts</TabsTrigger>
					</TabsList>

					<div className="flex flex-col lg:flex-row gap-6">
						<div className="flex-1 lg:max-w-4xl">
							<TabsContent value="published" className="mt-0 space-y-4">
								{displayedPosts.length ? (
									<>
										<PostsList posts={displayedPosts} projectId={+projectId!} />
										{!isFetchingNextPage && (
											<div className="flex justify-center pt-4">
												{hasNextPage ? (
													<button
														type="button"
														onClick={() => fetchNextPage()}
														className={buttonVariants({ variant: "outline" })}
													>
														Load More
													</button>
												) : (
													<div className="text-center text-muted-foreground text-sm">
														No more posts
													</div>
												)}
											</div>
										)}
										{isFetchingNextPage && (
											<div className="flex justify-center py-4">
												<span className="text-sm text-muted-foreground">
													Loading...
												</span>
											</div>
										)}
									</>
								) : (
									<EmptyState
										show={!displayedPosts.length}
										label="post"
										createLink={`/${tenant}/projects/${projectId}/posts?create=true`}
									/>
								)}
							</TabsContent>

							<TabsContent value="drafts" className="mt-0 space-y-4">
								{displayedPosts.length ? (
									<PostsList posts={displayedPosts} projectId={+projectId!} />
								) : (
									<div className="text-center text-muted-foreground py-8">
										No draft posts
									</div>
								)}
							</TabsContent>
						</div>

						<aside className="hidden lg:block lg:w-80 space-y-4">
							<h3 className="font-semibold text-sm">Filters</h3>

							<div className="space-y-2">
								<Label htmlFor="category-filter" className="text-xs">
									Category
								</Label>
								<Select
									value={categoryFilter}
									onValueChange={(value) => setCategoryFilter(value)}
								>
									<SelectTrigger id="category-filter" className="h-9">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Categories</SelectItem>
										<SelectItem value="announcement">Announcement</SelectItem>
										<SelectItem value="fyi">FYI</SelectItem>
										<SelectItem value="question">Question</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="author-filter" className="text-xs">
									Author
								</Label>
								<Select
									value={authorFilter}
									onValueChange={(value) => setAuthorFilter(value)}
								>
									<SelectTrigger id="author-filter" className="h-9">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Authors</SelectItem>
										{uniqueAuthors.map((author) => (
											<SelectItem key={author.id} value={author.id}>
												{author.name || "Unknown"}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="date-filter" className="text-xs">
									Date
								</Label>
								<Popover>
									<PopoverTrigger asChild>
										<button
											type="button"
											id="date-filter"
											className="w-full h-9 px-3 py-2 text-sm rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-left flex items-center justify-between"
										>
											<span>
												{dateFilter
													? format(new Date(dateFilter), "MMM dd, yyyy")
													: "Select date"}
											</span>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="opacity-50"
											>
												<title>Calendar</title>
												<rect
													width="18"
													height="18"
													x="3"
													y="4"
													rx="2"
													ry="2"
												/>
												<line x1="16" x2="16" y1="2" y2="6" />
												<line x1="8" x2="8" y1="2" y2="6" />
												<line x1="3" x2="21" y1="10" y2="10" />
											</svg>
										</button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={dateFilter ? new Date(dateFilter) : undefined}
											onSelect={(date) => {
												if (date) {
													setDateFilter(format(date, "yyyy-MM-dd"));
												} else {
													setDateFilter("");
												}
											}}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>

							{(categoryFilter !== "all" ||
								authorFilter !== "all" ||
								dateFilter) && (
								<button
									type="button"
									onClick={() => {
										setCategoryFilter("all");
										setAuthorFilter("all");
										setDateFilter("");
									}}
									className="text-xs text-muted-foreground hover:text-foreground underline"
								>
									Clear filters
								</button>
							)}
						</aside>
					</div>
				</Tabs>
			</PageSection>

			{project?.canEdit && (
				<Panel open={create} setOpen={setCreate}>
					<Title>
						<PageTitle title="New Post" compact />
					</Title>
					<PostForm />
				</Panel>
			)}
		</>
	);
}
