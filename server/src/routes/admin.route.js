import Router from "express";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { isOrganizer } from "../middlewares/organizer.middleware.js";
import {
    verifyEventCompletion,
    changeEventStatus,
    getEventStatusHistory,
    getLeaderboard,
    getStats,
    updateUserRole
} from "../controllers/admin.controller.js";

const router = Router();

router.route("/verify-event").post(userAuth, isAdmin, verifyEventCompletion);
router.route("/change-status").post(userAuth, isOrganizer, changeEventStatus);
router.route("/event-history/:eventId").get(userAuth, isAdmin, getEventStatusHistory);
router.route("/leaderboard").get(getLeaderboard);
router.route("/stats").get(getStats);
router.route("/update-role").post(userAuth, isAdmin, updateUserRole);

export default router;