"use client";

import { Loader2, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { OtpVerificationForm } from "@/components/auth/otp-verification-form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";

export default function SignInPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirect = searchParams.get("redirect") || "/start";

	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);

	async function handleSendOtp(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);

		try {
			const result = await authClient.emailOtp.sendVerificationOtp({
				email,
				type: "sign-in",
			});

			if (result.error) {
				toast.error(result.error.message || "Failed to send verification code");
			} else {
				setSent(true);
				toast.success("Check your email for the verification code");
			}
		} catch (error) {
			toast.error("Failed to send verification code. Please try again.");
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
						<CardTitle>Enter verification code</CardTitle>
						<CardDescription>
							We sent a 6-digit code to <strong>{email}</strong>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<OtpVerificationForm
							email={email}
							onSuccess={async () => {
								router.refresh();
								router.push(redirect);
							}}
							onBack={() => setSent(false)}
						/>
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
						Enter your email to receive a verification code
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSendOtp} className="space-y-4">
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
							Send verification code
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
