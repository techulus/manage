import PageSection from "@/components/core/section";
import { DeleteButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { Button, buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/betterauth/auth";
import {
	AlertTriangle,
	ArrowLeftCircle,
	DatabaseBackup,
	User,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createDatabaseBackup, deleteWorkspace } from "../../actions";

export default async function ManageWorkspace(props: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await props.params;

	const workspace = await auth().api.getFullOrganization({
		headers: await headers(),
		query: {
			organizationSlug: slug,
		},
	});

	if (!workspace) {
		return notFound();
	}

	return (
		<>
			<PageTitle title={`Manage ${workspace.name}`}>
				<Link
					href={`/${workspace.slug}/today`}
					className={buttonVariants({
						variant: "link",
						size: "sm",
						className: "-ml-2",
					})}
				>
					<ArrowLeftCircle className="inline-block h-6 w-6" />
					Back to Workspace
				</Link>
			</PageTitle>

			<PageSection topInset bottomMargin>
				<h2 className="flex items-center text-xl font-semibold leading-7 text-gray-900 dark:text-gray-200 p-4">
					<User className="mr-2 inline-block h-6 w-6" />
					Users
				</h2>

				<div className="p-4 sm:flex">
					<dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
						Manage
					</dt>
					<dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
						<div className="text-gray-900 dark:text-gray-200">
							{workspace.members.map((member) => (
								<div key={member.id} className="flex items-center gap-x-2">
									{member.user.name} ({member.role})
								</div>
							))}
						</div>
					</dd>
				</div>
			</PageSection>

			<PageSection>
				<h2 className="flex items-center text-xl font-semibold leading-7 text-gray-900 dark:text-gray-200 p-4">
					<DatabaseBackup className="mr-2 inline-block h-6 w-6" />
					Database
				</h2>
				<div className="p-4 sm:flex">
					<dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
						Backup
					</dt>
					<dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
						<div className="text-gray-900 dark:text-gray-200">
							<form action={createDatabaseBackup}>
								<input type="hidden" name="id" value={workspace.id} />
								<Button type="submit" variant="outline">
									Download Backup
								</Button>
							</form>
						</div>
					</dd>
				</div>
			</PageSection>

			<PageSection className="border-red-400 dark:border-red-900">
				<h2 className="flex items-center text-xl font-semibold leading-7 text-red-500 dark:text-red-700 p-4">
					<AlertTriangle className="mr-2 inline-block h-6 w-6" />
					Danger Zone
				</h2>
				<div className="p-4 sm:flex">
					<dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
						Delete Workspace?
					</dt>
					<dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
						<div className="text-gray-900 dark:text-gray-200">
							<form action={deleteWorkspace}>
								<input type="hidden" name="id" value={workspace.id} />
								<DeleteButton />
							</form>
						</div>
					</dd>
				</div>
			</PageSection>
		</>
	);
}
