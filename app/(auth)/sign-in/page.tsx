"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { authClient, signIn } from "@/lib/betterauth/auth-client";
import { FingerprintIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import logo from "../../../public/images/logo.png";

export default function SignInForm() {
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [hasSentEmail, setHasSentEmail] = useState(false);
	const [processing, setProcessing] = useState(false);

	const router = useRouter();

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

				{hasSentEmail ? (
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
				) : (
					<CardContent className="grid gap-4">
						<Label htmlFor="email">Email</Label>

						<Input
							id="email"
							type="email"
							placeholder="m@example.com"
							required
							onChange={(e) => {
								setEmail(e.target.value);
							}}
							value={email}
						/>

						<Button
							className="gap-2"
							disabled={processing}
							onClick={async () => {
								try {
									if (!email) return;
									setProcessing(true);
									toast.promise(
										authClient.emailOtp
											.sendVerificationOtp({ email, type: "sign-in" })
											.then((result) => {
												if (result?.error) {
													throw new Error(result.error?.message);
												}
												setHasSentEmail(true);
											})
											.finally(() => {
												setProcessing(false);
											}),
										{
											loading: "Sending your login code...",
											success: "Login code sent!",
											error: "Failed to send login code.",
										},
									);
								} catch (error) {
									console.error(error);
								} finally {
									setProcessing(false);
								}
							}}
						>
							Sign-in with Email
						</Button>

						<Button
							variant="secondary"
							className="gap-2"
							disabled={processing}
							onClick={async () => {
								setProcessing(true);
								toast.promise(
									signIn
										.passkey()
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
										loading: "Waiting for passkey...",
										success: "Signed in with passkey!",
										error: "Failed to receive passkey.",
									},
								);
							}}
						>
							<FingerprintIcon size={16} />
							Sign-in with Passkey
						</Button>
					</CardContent>
				)}
			</Card>
		</div>
	);
}
