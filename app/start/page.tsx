"use client";

import { Spinner } from "@/components/core/loaders";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import logo from "../../public/images/logo.png";

export default function Start() {
	const router = useRouter();

	const trpc = useTRPC();
	const { data } = useQuery({
		...trpc.user.setup.queryOptions(),
		refetchInterval: 2500,
	});

	useEffect(() => {
		if (!data) return;

		if (data.redirect) {
			router.replace(data.redirect);
			return;
		}
	}, [data, router.replace]);

	return (
		<div className="flex min-h-screen w-full items-center justify-center">
			<div className="flex flex-col items-center gap-4">
				<Image src={logo} alt="Manage" width={48} height={48} />
				<Spinner className="mt-6" />
			</div>
		</div>
	);
}
