"use client";

import PageSection from "@/components/core/section";
import PageTitle from "@/components/layout/page-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/betterauth/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateWorkspace() {
	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");

	const router = useRouter();

	return (
		<>
			<PageTitle title="Create Workspace">
				<p className="text-md">
					A workspace contains projects and team members. You can create
					multiple workspaces for different teams or projects.
				</p>
			</PageTitle>

			<PageSection topInset>
				<div className="grid gap-4 py-4 mx-auto w-full max-w-[400px]">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label className="text-right">Name</Label>
						<Input
							value={name}
							onChange={(evt) => setName(evt.target.value ?? "")}
							className="col-span-3"
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label className="text-right">Slug</Label>
						<Input
							value={slug}
							onChange={(evt) => setSlug(evt.target.value ?? "")}
							className="col-span-3"
						/>
					</div>
					<Button
						type="button"
						className="max-w-[180px] ml-auto"
						onClick={async () => {
							await authClient.organization.create({
								name,
								slug,
							});
							await authClient.organization.setActive({
								organizationSlug: slug,
							});
							router.push("/start");
						}}
					>
						Create
					</Button>
				</div>
			</PageSection>
		</>
	);
}
