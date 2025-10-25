"use client";

import { Title } from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useState } from "react";
import EmptyState from "@/components/core/empty-state";
import { Panel } from "@/components/core/panel";
import PageSection from "@/components/core/section";
import PostForm from "@/components/form/post";
import PageTitle from "@/components/layout/page-title";
import PostsList from "@/components/project/posts/posts-list";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/trpc/client";

export default function Posts() {
	const { projectId, tenant } = useParams();
	const [create, setCreate] = useQueryState(
		"create",
		parseAsBoolean.withDefault(false),
	);
	const [activeTab, setActiveTab] = useState("published");

	const trpc = useTRPC();

	const { data: project } = useQuery(
		trpc.projects.getProjectById.queryOptions({
			id: +projectId!,
		}),
	);

	const { data: publishedPosts = [] } = useQuery({
		...trpc.posts.list.queryOptions({
			projectId: +projectId!,
		}),
		enabled: activeTab === "published",
	});

	const { data: myDrafts = [] } = useQuery({
		...trpc.posts.myDrafts.queryOptions({
			projectId: +projectId!,
		}),
		enabled: activeTab === "drafts",
	});

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

					<TabsContent value="published">
						{publishedPosts.length ? (
							<PostsList posts={publishedPosts} projectId={+projectId!} />
						) : (
							<EmptyState
								show={!publishedPosts.length}
								label="post"
								createLink={`/${tenant}/projects/${projectId}/posts?create=true`}
							/>
						)}
					</TabsContent>

					<TabsContent value="drafts">
						{myDrafts.length ? (
							<PostsList posts={myDrafts} projectId={+projectId!} />
						) : (
							<div className="text-center text-muted-foreground py-8">
								No draft posts
							</div>
						)}
					</TabsContent>
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
