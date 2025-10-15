"use client";

import { useEffect } from "react";
import Loading from "@/app/loading";

export const ClientRedirect = ({ path }: { path: string }) => {
	useEffect(() => {
		console.log("Client redirect to", path);
		window.location.href = path;
	}, [path]);

	return <Loading />;
};
