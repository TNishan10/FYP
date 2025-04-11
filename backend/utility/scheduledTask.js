import { cleanupInactiveUsers } from "../controllers/UsersController.js";
import cron from "node-cron";

// Schedule cleanup to run at midnight every day
export const scheduleUserCleanup = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const deletedCount = await cleanupInactiveUsers();
      console.log(`Scheduled cleanup: ${deletedCount} inactive users deleted`);
    } catch (error) {
      console.error("Scheduled user cleanup failed:", error);
    }
  });

  console.log("Scheduled inactive user cleanup task initialized");
};
