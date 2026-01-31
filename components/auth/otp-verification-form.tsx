"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth/client";

interface OtpVerificationFormProps {
	email: string;
	onSuccess: () => void | Promise<void>;
	onBack: () => void;
}

export function OtpVerificationForm({
	email,
	onSuccess,
	onBack,
}: OtpVerificationFormProps) {
	const [otp, setOtp] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	async function handleVerifyOtp(e: React.FormEvent) {
		e.preventDefault();
		if (otp.length !== 6) return;

		setIsLoading(true);
		try {
			const result = await authClient.signIn.emailOtp({
				email,
				otp,
			});

			if (result.error) {
				toast.error(result.error.message || "Invalid verification code");
			} else {
				toast.success("Signed in successfully");
				await onSuccess();
			}
		} catch {
			toast.error("Failed to verify code. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}

	function handleBack() {
		setOtp("");
		onBack();
	}

	return (
		<form onSubmit={handleVerifyOtp} className="space-y-4">
			<div className="flex justify-center">
				<InputOTP
					maxLength={6}
					value={otp}
					onChange={setOtp}
					disabled={isLoading}
				>
					<InputOTPGroup>
						<InputOTPSlot index={0} />
						<InputOTPSlot index={1} />
						<InputOTPSlot index={2} />
						<InputOTPSlot index={3} />
						<InputOTPSlot index={4} />
						<InputOTPSlot index={5} />
					</InputOTPGroup>
				</InputOTP>
			</div>
			<Button
				type="submit"
				className="w-full"
				disabled={isLoading || otp.length !== 6}
			>
				{isLoading ? "Verifying..." : "Verify code"}
			</Button>
			<Button
				type="button"
				variant="outline"
				className="w-full"
				onClick={handleBack}
			>
				Use a different email
			</Button>
		</form>
	);
}
