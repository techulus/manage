"use client";

import { createCable } from "@anycable/web";
import { createContext, useContext } from "react";

const getAuthenticatedCable = (token: string) =>
	createCable(
		`${process.env.NEXT_PUBLIC_ANYCABLE_WEBSOCKET_URL!}?jid=${token}`,
		{
			logLevel: "debug",
		},
	);

type CableContext = {
	cable: ReturnType<typeof getAuthenticatedCable>;
};

const CableContext = createContext<CableContext | null>(null);

export function useCable() {
	const context = useContext(CableContext);
	if (!context) {
		throw new Error("useCable must be used within a CableProvider");
	}
	return context.cable;
}

export const CableProvider = ({
	children,
	token,
}: { children: React.ReactNode; token: string }) => {
	const cable = getAuthenticatedCable(token);

	return (
		<CableContext.Provider value={{ cable }}>{children}</CableContext.Provider>
	);
};
