"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/betterauth/auth-client";
import { FingerprintIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import logo from "../../../public/images/logo.png";

export default function SignInForm() {
	const [email, setEmail] = useState("");
	const [processing, setProcessing] = useState(false);
	const [hasSendEmail, setHasSendEmail] = useState(false);
	const { theme } = useTheme();

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
							className="-mt-2 mr-2 rounded-md"
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

					{hasSendEmail ? (
						<p className="text-sm text-gray-500 dark:text-gray-400">
							An email has been sent to{" "}
							<span className="font-semibold">{email}</span> with a magic link
							to sign in.
						</p>
					) : (
						<Button
							className="gap-2"
							disabled={processing}
							onClick={async () => {
								try {
									if (!email) return;
									setProcessing(true);
									toast.promise(
										signIn
											.magicLink({ email, callbackURL: "/start" })
											.then((result) => {
												if (result?.error) {
													throw new Error(result.error?.message);
												}

												setHasSendEmail(true);
											})
											.finally(() => {
												setProcessing(false);
											}),
										{
											loading: "Sending magic link...",
											success: "Magic link sent!",
											error: "Failed to send magic link.",
										},
									);
								} catch (error) {
									console.error(error);
								} finally {
									setProcessing(false);
								}
							}}
						>
							Sign-in with Magic Link
						</Button>
					)}

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
			</Card>
		</div>
	);
}
