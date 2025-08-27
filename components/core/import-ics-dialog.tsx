"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, FileIcon, Upload } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { displayMutationError } from "@/lib/utils/error";
import { useTRPC } from "@/trpc/client";
import { Spinner } from "./loaders";

interface ImportResult {
	success: boolean;
	imported: number;
	total: number;
	errors?: string[];
}

interface ImportIcsDialogProps {
	projectId: number;
	children?: React.ReactNode;
}

export function ImportIcsDialog({ projectId, children }: ImportIcsDialogProps) {
	const [open, setOpen] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [result, setResult] = useState<ImportResult | null>(null);

	const queryClient = useQueryClient();
	const trpc = useTRPC();

	const importMutation = useMutation(
		trpc.events.importFromIcs.mutationOptions({
			onSuccess: (data) => {
				setResult(data);
				// Invalidate all event-related queries
				queryClient.invalidateQueries({
					predicate: (query) => {
						return (
							query.queryKey[0] === "events" ||
							(Array.isArray(query.queryKey) &&
								query.queryKey.includes("getTodayData"))
						);
					},
				});
			},
			onError: displayMutationError,
		}),
	);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0] || null;
		setFile(selectedFile);
		setResult(null);
		importMutation.reset();
	};

	const handleImport = async () => {
		if (!file) return;

		if (!file.name.endsWith(".ics")) {
			// Handle error - could set a local error state or use notification
			return;
		}

		try {
			const icsContent = await file.text();
			importMutation.mutate({
				projectId,
				icsContent,
			});
		} catch (err) {
			console.error("Failed to read file:", err);
		}
	};

	const handleClose = () => {
		setOpen(false);
		setFile(null);
		setResult(null);
		importMutation.reset();
	};

	const renderResult = () => {
		if (importMutation.error) {
			return (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{importMutation.error.message}</AlertDescription>
				</Alert>
			);
		}

		if (result) {
			return (
				<div className="space-y-3">
					<Alert>
						<CheckCircle className="h-4 w-4" />
						<AlertDescription>
							Successfully imported {result.imported} out of {result.total}{" "}
							events.
						</AlertDescription>
					</Alert>

					{result.errors && result.errors.length > 0 && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								<div className="space-y-1">
									<p>Some events could not be imported:</p>
									<ul className="list-disc list-inside text-sm">
										{result.errors.slice(0, 3).map((error) => (
											<li key={error.substring(0, 20)} className="truncate">
												{error}
											</li>
										))}
										{result.errors.length > 3 && (
											<li>... and {result.errors.length - 3} more</li>
										)}
									</ul>
								</div>
							</AlertDescription>
						</Alert>
					)}
				</div>
			);
		}

		return null;
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button variant="outline" size="sm">
						<Upload className="mr-2 h-4 w-4" />
						Import Event (ICS file)
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Import Calendar Events</DialogTitle>
					<DialogDescription>
						Upload an ICS file to import calendar events into this project.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="ics-file">Select ICS File</Label>
						<div className="flex items-center space-x-2">
							<Input
								id="ics-file"
								type="file"
								accept=".ics"
								onChange={handleFileChange}
								className="flex-1"
							/>
						</div>
						{file && (
							<div className="flex items-center space-x-2 text-sm text-muted-foreground">
								<FileIcon className="h-4 w-4" />
								<span>{file.name}</span>
								<span>({Math.round(file.size / 1024)} KB)</span>
							</div>
						)}
					</div>

					{renderResult()}
				</div>

				<DialogFooter>
					{result ? (
						<Button onClick={handleClose}>Close</Button>
					) : (
						<>
							<Button variant="outline" onClick={handleClose}>
								Cancel
							</Button>
							<Button
								onClick={handleImport}
								disabled={!file || importMutation.isPending}
								className="min-w-[100px]"
							>
								{importMutation.isPending ? (
									<Spinner className="text-secondary" message="Importing..." />
								) : (
									<>
										<Upload className="mr-2 h-4 w-4" />
										Import
									</>
								)}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
