import { document } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

export const documentsRouter = createTRPCRouter({
	getById: baseProcedure
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
