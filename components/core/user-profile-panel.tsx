"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { displayMutationError } from "@/lib/utils/error";
import { useTRPC } from "@/trpc/client";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Spinner, SpinnerWithSpacing } from "./loaders";

interface UserProfilePanelProps {
	open: boolean;
	setOpen: (open: boolean) => void;
}

export function UserProfilePanel({ open, setOpen }: UserProfilePanelProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { data: user, isLoading } = useQuery(
		trpc.user.getCurrentUser.queryOptions(),
	);

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");

	useEffect(() => {
		if (user) {
			setFirstName(user.firstName ?? "");
			setLastName(user.lastName ?? "");
		}
	}, [user]);

	const updateProfile = useMutation(
		trpc.user.updateProfile.mutationOptions({
			onError: displayMutationError,
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.user.getCurrentUser.queryKey(),
				});
				setOpen(false);
			},
		}),
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		updateProfile.mutate({ firstName, lastName });
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Profile</DialogTitle>
					<DialogDescription>Update your profile information</DialogDescription>
				</DialogHeader>
				{isLoading ? (
					<SpinnerWithSpacing />
				) : (
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="firstName">First name</Label>
							<Input
								id="firstName"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="lastName">Last name</Label>
							<Input
								id="lastName"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label>Email</Label>
							<Input value={user?.email ?? ""} disabled />
						</div>
						<DialogFooter>
							<Button type="submit" disabled={updateProfile.isPending}>
								{updateProfile.isPending ? (
									<Spinner className="h-4 w-4" />
								) : null}
								Save
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
