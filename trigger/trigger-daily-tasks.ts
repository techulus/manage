import { opsDb } from "@/ops/database";
import { schedules } from "@trigger.dev/sdk/v3";
import { handleDormancy } from "./handle-dormancy";
import { rotateActivityLogs } from "./rotate-activity-logs";

export const triggerDailyTasks = schedules.task({
  id: "trigger-daily-tasks",
  cron: "0 0 * * *",
  retry: {
    maxAttempts: 3,
  },
  run: async () => {
    const admin = opsDb();

    const users = await admin.query.users.findMany();

    return Promise.all([
      handleDormancy.trigger(),
      rotateActivityLogs.batchTrigger(
        users.map((user) => ({ payload: { ownerId: user.id } }))
      ),
    ]);
  },
});
