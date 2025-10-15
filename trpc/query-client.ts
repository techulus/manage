import {
	defaultShouldDehydrateQuery,
	QueryClient,
} from "@tanstack/react-query";
import superjson from "superjson";
import { toMs } from "@/lib/utils/date";

export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: toMs(15),
			},
			dehydrate: {
				serializeData: superjson.serialize,
				shouldDehydrateQuery: (query) =>
					defaultShouldDehydrateQuery(query) ||
					query.state.status === "pending",
			},
			hydrate: {
				deserializeData: superjson.deserialize,
			},
		},
	});
}
