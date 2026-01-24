"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, useSession } from "@/lib/auth/client";
import { toast } from "sonner";
import { OtpVerificationForm } from "@/components/auth/otp-verification-form";

export default function AcceptInvitePage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const emailFromUrl = searchParams.get("email") || "";
	const invitationId = searchParams.get("invitationId") || "";
	const [email, setEmail] = useState(emailFromUrl);
	const [isLoading, setIsLoading] = useState(false);
	const [isAccepting, setIsAccepting] = useState(false);
	const [sent, setSent] = useState(false);
	const { data: session, isPending, refetch } = useSession();

	async function handleAcceptInvitation() {
		setIsAccepting(true);
		try {
			const result = await authClient.organization.acceptInvitation({
				invitationId,
			});

			if (result.error) {
				toast.error(result.error.message || "Failed to accept invitation");
			} else {
				toast.success("Invitation accepted!");
				router.push("/start");
			}
		} catch (error) {
			toast.error("Failed to accept invitation");
		} finally {
			setIsAccepting(false);
		}
	}

	async function handleSendOtp() {
		if (!email) {
			toast.error("Please enter your email");
			return;
		}

		setIsLoading(true);
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
			toast.error("Failed to send verification code");
		} finally {
			setIsLoading(false);
		}
	}

	async function handleOtpSuccess() {
		await refetch();
	}

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		);
	}

	if (session?.user) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="w-full max-w-md space-y-6 p-8">
					<div className="text-center space-y-2">
						<h1 className="text-2xl font-bold">Accept Invitation</h1>
						<p className="text-muted-foreground">
							You're signed in as <strong>{session.user.email}</strong>
						</p>
					</div>

					<Button
						onClick={handleAcceptInvitation}
						disabled={isAccepting}
						className="w-full"
					>
						{isAccepting
							? "Accepting..."
							: "Accept invitation & join workspace"}
					</Button>
				</div>
			</div>
		);
	}

	if (sent) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="w-full max-w-md space-y-6 p-8">
					<div className="text-center space-y-2">
						<h1 className="text-2xl font-bold">Enter verification code</h1>
						<p className="text-muted-foreground">
							We sent a 6-digit code to <strong>{email}</strong>
						</p>
					</div>

					<OtpVerificationForm
						email={email}
						onSuccess={handleOtpSuccess}
						onBack={() => setSent(false)}
					/>
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
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email"
						/>
					</div>

					<Button
						onClick={handleSendOtp}
						disabled={isLoading || !email}
						className="w-full"
					>
						{isLoading ? "Sending..." : "Send verification code"}
					</Button>
				</div>
			</div>
		</div>
	);
}
