"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient, signIn } from "@/lib/betterauth/auth-client";
import { ArrowLeft, Fingerprint } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import logo from "../../../public/images/logo.png";

interface OtpVerificationProps {
	email: string;
	onBack: () => void;
}

function OtpVerification({ email, onBack }: OtpVerificationProps) {
	const [otp, setOtp] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectTo = searchParams.get("redirectTo");

	const handleVerify = useCallback(async () => {
		if (otp.length !== 6) {
			toast.error("Please enter all 6 digits");
			return;
		}

		setIsLoading(true);

		try {
			toast.info("Verifying login code...");
			await signIn.emailOtp({ email, otp }).then((result) => {
				if (result?.error) {
					throw new Error(result.error?.message);
				}
				toast.success("Login code verified!");
				router.push(redirectTo ?? "/start");
			});
		} catch (err) {
			toast.error("Verification failed");
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}, [otp, email, router, redirectTo]);

	return (
		<Card className="w-full max-w-md border-border bg-card text-card-foreground">
			<CardHeader>
				<div className="flex items-center">
					<Button
						variant="ghost"
						size="icon"
						className="mr-2 h-8 w-8"
						onClick={onBack}
					>
						<ArrowLeft className="h-4 w-4" />
						<span className="sr-only">Back</span>
					</Button>
					<div>
						<CardTitle className="text-2xl text-foreground">
							Verify OTP
						</CardTitle>
						<CardDescription className="text-muted-foreground">
							Enter the 6-digit code sent to {email}
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex justify-center py-4">
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
				</div>
				<p className="text-center text-sm text-muted-foreground">
					Didn&apos;t receive the code?{" "}
					<Button variant="link" className="p-0 h-auto" onClick={onBack}>
						Try again
					</Button>
				</p>
			</CardContent>
			<CardFooter>
				<Button
					onClick={handleVerify}
					className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
					disabled={isLoading || otp.length !== 6}
				>
					{isLoading ? "Verifying..." : "Verify & Sign In"}
				</Button>
			</CardFooter>
		</Card>
	);
}

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [otpSent, setOtpSent] = useState(false);

	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectTo = searchParams.get("redirectTo");

	const handleSendOtp = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();

			// RFC 5322 compliant email regex
			const emailRegex =
				/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
			if (!email || !emailRegex.test(email)) {
				toast.error("Please enter a valid email address");
				return;
			}

			setIsLoading(true);

			try {
				toast.info("Sending login code...");
				await authClient.emailOtp
					.sendVerificationOtp({ email, type: "sign-in" })
					.then((result) => {
						if (result?.error) {
							throw new Error(result.error?.message);
						}
						toast.success("Login code sent!");
						setOtpSent(true);
					});
			} catch (err) {
				toast.error("Failed to send OTP");
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		},
		[email],
	);

	const handlePasskeyLogin = useCallback(async () => {
		setIsLoading(true);

		try {
			toast.info("Waiting for passkey...");
			await signIn.passkey().then((result) => {
				if (result?.error) {
					throw new Error(result.error?.message);
				}
				toast.success("Signed in with passkey!");
				router.push(redirectTo ?? "/start");
			});
		} catch (err) {
			toast.error("Authentication failed");
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}, [router, redirectTo]);

	const resetOtpFlow = useCallback(() => {
		setOtpSent(false);
	}, []);

	const handleEmailChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setEmail(e.target.value);
		},
		[],
	);

	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
			{otpSent ? (
				<OtpVerification email={email} onBack={resetOtpFlow} />
			) : (
				<Card className="w-full max-w-md border-border bg-card text-card-foreground">
					<CardHeader className="space-y-1">
						<div className="flex items-center space-x-2">
							<Image
								src={logo}
								alt="Manage"
								width={32}
								height={32}
								className="-mt-2 mr-2"
							/>
							<CardTitle className="text-2xl">Manage</CardTitle>
						</div>
						<CardDescription className="text-muted-foreground">
							Sign in to your account to access your dashboard
						</CardDescription>
					</CardHeader>
					<Tabs defaultValue="email" className="w-full">
						<TabsList className="grid grid-cols-2 bg-muted text-muted-foreground mx-4">
							<TabsTrigger
								value="email"
								className="data-[state=active]:bg-background data-[state=active]:text-foreground"
							>
								Email OTP
							</TabsTrigger>
							<TabsTrigger
								value="passkey"
								className="data-[state=active]:bg-background data-[state=active]:text-foreground"
							>
								Passkey
							</TabsTrigger>
						</TabsList>
						<TabsContent value="email">
							<form onSubmit={handleSendOtp}>
								<CardContent className="space-y-4 pt-4">
									<div className="space-y-2">
										<Label htmlFor="email" className="text-foreground">
											Email
										</Label>
										<Input
											id="email"
											type="email"
											placeholder="name@example.com"
											value={email}
											onChange={handleEmailChange}
											className="bg-input text-input-foreground"
											required
										/>
									</div>
								</CardContent>
								<CardFooter>
									<Button
										type="submit"
										className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
										disabled={isLoading}
									>
										{isLoading ? "Sending..." : "Send OTP"}
									</Button>
								</CardFooter>
							</form>
						</TabsContent>
						<TabsContent value="passkey">
							<CardContent className="space-y-4 pt-4">
								<div className="flex flex-col items-center justify-center space-y-4 py-4">
									<Fingerprint className="h-16 w-16 text-primary" />
									<p className="text-center text-sm text-muted-foreground">
										Use your device biometrics or security key to sign in
										securely without a password
									</p>
								</div>
							</CardContent>
							<CardFooter>
								<Button
									onClick={handlePasskeyLogin}
									className="w-full"
									variant="outline"
									disabled={isLoading}
								>
									{isLoading ? "Authenticating..." : "Continue with Passkey"}
								</Button>
							</CardFooter>
						</TabsContent>
					</Tabs>
				</Card>
			)}
		</main>
	);
}
