import { opsDb } from "@/ops/database";
import { users } from "@/ops/schema";
import { task } from "@trigger.dev/sdk/v3";
import { lt } from "drizzle-orm";

export const handleDormancy = task({
  id: "handle-dormancy",
  run: async () => {
    const admin = opsDb();

    const dormancyDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const found = await admin
      .select()
      .from(users)
      .where(lt(users.lastActiveAt, dormancyDate));

    return found;
  },
});
