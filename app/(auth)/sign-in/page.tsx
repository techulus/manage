"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/betterauth/auth-client";
import { FingerprintIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import logo from "../../../public/images/logo.png";

export default function SignInForm() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [hasSendEmail, setHasSendEmail] = useState(false);

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
							disabled={loading}
							onClick={async () => {
								try {
									setLoading(true);
									await signIn.magicLink({ email, callbackURL: "/start" });
									setHasSendEmail(true);
								} catch (error) {
									console.error(error);
								} finally {
									setLoading(false);
								}
							}}
						>
							Sign-in with Magic Link
						</Button>
					)}

					<Button
						variant="secondary"
						className="gap-2"
						disabled={loading}
						onClick={async () => {
							setLoading(true);
							await signIn.passkey();
							router.push("/start");
							setLoading(false);
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
