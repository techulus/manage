"use client";

import { Spinner } from "@/components/core/loaders";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import logo from "../../public/images/logo.png";

export default function Start() {
	const router = useRouter();

	useEffect(() => {
		const pollSetup = () => {
			fetch("/api/user/setup")
				.then((res) => res.json())
				.then((data) => {
					if (data.ready) {
						router.replace(data.redirect);
						return;
					}

					if (data.redirect) {
						router.replace(data.redirect);
						return;
					}

					// setTimeout(pollSetup, 2500);
				})
				.catch((error) => {
					console.error("Error checking setup status:", error);
					// setTimeout(pollSetup, 2500);
				});
		};

		pollSetup();
	}, [router]);

	return (
		<div className="flex min-h-screen w-full items-center justify-center">
			<div className="flex flex-col items-center gap-4">
				<Image src={logo} alt="Manage" width={48} height={48} />
				<Spinner className="mt-6" />
			</div>
		</div>
	);
}
