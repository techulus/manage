"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/betterauth/auth-client";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import logo from "../../../public/images/logo.png";

export default function VerifyOtpForm() {
	const [otp, setOtp] = useState("");
	const [processing, setProcessing] = useState(false);

	const router = useRouter();
	const searchParams = useSearchParams();
	const email = searchParams.get("email");

	return (
		<div className="m-6 flex h-full items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader>
					<div className="flex lg:flex-1">
						<Image
							src={logo}
							alt="Manage"
							width={32}
							height={32}
							className="-mt-2 mr-2"
						/>

						<Link href="/" className="-m-1.5 p-1.5" prefetch={false}>
							<p className="relative tracking-tight">
								Manage
								<sup className="absolute left-[calc(100%+.1rem)] top-0 text-xs">
									[beta]
								</sup>
							</p>
						</Link>
					</div>

					<CardTitle className="text-hero text-2xl">Get Started</CardTitle>
				</CardHeader>

				<CardContent className="grid gap-4">
					<Label>Login Code</Label>

					<InputOTP
						maxLength={6}
						onChange={(value) => {
							setOtp(value);
						}}
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

					<Button
						className="gap-2"
						disabled={processing}
						onClick={async () => {
							try {
								if (!otp || !email) return;
								setProcessing(true);
								toast.promise(
									signIn
										.emailOtp({ email, otp })
										.then((result) => {
											if (result?.error) {
												throw new Error(result.error?.message);
											}

											router.push("/start");
										})
										.finally(() => {
											setProcessing(false);
										}),
									{
										loading: "Verifying your login code...",
										success: "Login code verified!",
										error: "Failed to verify login code.",
									},
								);
							} catch (error) {
								console.error(error);
							} finally {
								setProcessing(false);
							}
						}}
					>
						Verify Login Code
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
