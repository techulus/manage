import { logtoConfig } from "@/app/logto";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "@logto/next/server-actions";
import Image from "next/image";
import Link from "next/link";
import logo from "../../../public/images/logo.png";

export default function SignInForm() {
	return (
		<div className="m-6 flex h-full items-center justify-center">
			<Card className="w-full max-w-md">
				<div className="flex p-6 lg:flex-1">
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

				<CardHeader>
					<CardTitle className="text-hero text-3xl">Get Started</CardTitle>
				</CardHeader>

				<CardContent className="grid gap-4">
					<Button
						type="button"
						onClick={async () => {
							"use server";
							await signIn(logtoConfig);
						}}
						className="w-full"
					>
						Sign in
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
