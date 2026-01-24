"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SpinnerWithSpacing } from "@/components/core/loaders";
import EditableText from "@/components/form/editable-text";
import { displayMutationError } from "@/lib/utils/error";
import { useTRPC } from "@/trpc/client";

export function ProfileSettings() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { data: user, isLoading } = useQuery(
		trpc.user.getCurrentUser.queryOptions(),
	);

	const updateProfile = useMutation(
		trpc.user.updateProfile.mutationOptions({
			onError: displayMutationError,
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.user.getCurrentUser.queryKey(),
				});
			},
		}),
	);

	if (isLoading) {
		return <SpinnerWithSpacing />;
	}

	if (!user) {
		return null;
	}

	return (
		<>
			<div className="p-4 sm:flex items-center">
				<p className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
					First name
				</p>
				<EditableText
					value={user.firstName ?? ""}
					label="First name"
					onChange={async (value) => {
						await updateProfile.mutateAsync({
							firstName: value,
							lastName: user.lastName ?? "",
						});
					}}
				/>
			</div>

			<div className="p-4 sm:flex items-center">
				<p className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
					Last name
				</p>
				<EditableText
					value={user.lastName ?? ""}
					label="Last name"
					onChange={async (value) => {
						await updateProfile.mutateAsync({
							firstName: user.firstName ?? "",
							lastName: value,
						});
					}}
				/>
			</div>

			<div className="p-4 sm:flex items-center">
				<p className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
					Email address
				</p>
				<p>{user.email}</p>
			</div>
		</>
	);
}
