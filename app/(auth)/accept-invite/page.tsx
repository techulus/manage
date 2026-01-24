"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";

export default function AcceptInvitePage() {
	const searchParams = useSearchParams();
	const email = searchParams.get("email") || "";
	const [isLoading, setIsLoading] = useState(false);
	const [sent, setSent] = useState(false);

	async function handleSignIn() {
		if (!email) {
			toast.error("No email provided");
			return;
		}

		setIsLoading(true);
		try {
			const result = await authClient.signIn.magicLink({
				email,
				callbackURL: "/start",
			});

			if (result.error) {
				toast.error(result.error.message || "Failed to send sign in link");
			} else {
				setSent(true);
				toast.success("Check your email for the sign in link");
			}
		} catch (error) {
			console.error("Sign in error:", error);
			toast.error("Failed to send sign in link");
		} finally {
			setIsLoading(false);
		}
	}

	if (sent) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="w-full max-w-md space-y-6 p-8">
					<div className="text-center space-y-2">
						<h1 className="text-2xl font-bold">Check your email</h1>
						<p className="text-muted-foreground">
							We sent a sign in link to <strong>{email}</strong>
						</p>
						<p className="text-sm text-muted-foreground">
							Click the link in the email to sign in and join the workspace.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="w-full max-w-md space-y-6 p-8">
				<div className="text-center space-y-2">
					<h1 className="text-2xl font-bold">You're invited!</h1>
					<p className="text-muted-foreground">
						You've been invited to join a workspace on Manage.
					</p>
				</div>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							value={email}
							disabled
							className="bg-muted"
						/>
					</div>

					<Button
						onClick={handleSignIn}
						disabled={isLoading || !email}
						className="w-full"
					>
						{isLoading ? "Sending..." : "Sign in to accept invitation"}
					</Button>
				</div>
			</div>
		</div>
	);
}
