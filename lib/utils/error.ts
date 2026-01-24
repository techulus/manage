import type { TRPCClientErrorLike } from "@trpc/client";
import { toast } from "sonner";
import type { AppRouter } from "@/trpc/routers/_app";

export function displayMutationError(error: TRPCClientErrorLike<AppRouter>) {
	const fieldErrors = error.data?.zodError?.fieldErrors;
	if (fieldErrors) {
		for (const error in fieldErrors) {
			toast.error(error);
			return;
		}
	}

	const formErrors = error.data?.zodError?.formErrors;
	if (formErrors) {
		for (const error of formErrors) {
			toast.error(error);
			return;
		}
	}

	toast.error(
		error.message ||
			"Oops! Something went wrong. Please try again or contact support.",
	);
}
