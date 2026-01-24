"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

export default function SignInPage() {
	const searchParams = useSearchParams();
	const redirect = searchParams.get("redirect") || "/start";

	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);

		try {
			await authClient.signIn.magicLink({
				email,
				callbackURL: redirect,
			});
			setSent(true);
			toast.success("Check your email for the sign-in link");
		} catch (error) {
			toast.error("Failed to send sign-in link. Please try again.");
			console.error(error);
		} finally {
			setLoading(false);
		}
	}

	if (sent) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<Mail className="h-6 w-6 text-primary" />
						</div>
						<CardTitle>Check your email</CardTitle>
						<CardDescription>
							We sent a sign-in link to <strong>{email}</strong>
						</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<p className="text-sm text-muted-foreground mb-4">
							Click the link in the email to sign in. The link will expire in 15
							minutes.
						</p>
						<Button
							variant="outline"
							onClick={() => {
								setSent(false);
								setEmail("");
							}}
						>
							Use a different email
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle>Sign in to Manage</CardTitle>
					<CardDescription>
						Enter your email to receive a sign-in link
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={loading}
							/>
						</div>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Send sign-in link
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
