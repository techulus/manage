import { opsDb } from "@/ops/database";
import { _user } from "@/ops/schema";
import { client } from "@/trigger";
import { cronTrigger } from "@trigger.dev/sdk";
import { lt } from "drizzle-orm";

client.defineJob({
  id: "handle-dormancy",
  name: "Handle Dormancy",
  version: "0.0.1",
  trigger: cronTrigger({
    cron: "0 9 * * *",
  }),
  run: async (_, io, __) => {
    const admin = opsDb();

    const users = await io.runTask(
      "fetch-users",
      async () => {
        const dormancyDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        return await admin
          .select()
          .from(_user)
          .where(lt(_user.lastActiveAt, dormancyDate));
      },
      { name: "Fetch users to deactivate" }
    );

    await io.logger.info(`Found ${users.length} users to deactivate`);
  },
});