import type { AppRouter } from "@/trpc/routers/_app";
import type { TRPCClientErrorLike } from "@trpc/client";
import { toast } from "sonner";

export function displayMutationError(error: TRPCClientErrorLike<AppRouter>) {
	const fieldErrors = error.data?.zodError?.fieldErrors;
	if (fieldErrors) {
		for (const error in fieldErrors) {
			toast.error(fieldErrors[error]);
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
		"Oops! Something went wrong. Please try again or contact support.",
	);
}
