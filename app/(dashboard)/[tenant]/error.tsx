"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function ErrorComponent({
	error,
	reset,
}: {
	error: Error;
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error(error);
	}, [error]);

	return (
		<div className="mx-auto flex w-full max-w-7xl flex-auto flex-col justify-center px-6 py-24 lg:px-8">
			<p className="text-base font-semibold leading-8 text-primary">Oops!</p>
			<h1 className="mt-4 text-3xl font-bold tracking-tight text-red-600 sm:text-3xl">
				<AlertTriangle className="inline h-8 w-8" /> Something went wrong.
			</h1>
			<div className="mt-10">
				<button
					type="button"
					onClick={reset}
					className="text-sm font-semibold leading-7 text-primary"
				>
					<span aria-hidden="true">&larr;</span> Retry
				</button>
			</div>
		</div>
	);
}
