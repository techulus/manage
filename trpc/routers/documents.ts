import { document } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const documentsRouter = createTRPCRouter({
	getById: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const data = await ctx.db.query.document
				.findFirst({
					where: eq(document.id, input.id),
				})
				.execute();

			if (!data) {
				throw new Error(`Document with id ${input.id} not found`);
			}

			return data;
		}),
});
