import Router from "express";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import { isOrganizer } from "../middlewares/organizer.middleware.js";
import {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    getUnreadCount,
    sendEventAnnouncement
} from "../controllers/notification.controller.js";

const router = Router();

router.route("/").post(userAuth, createNotification);
router.route("/all").get(userAuth, getNotifications);
router.route("/unread-count").get(userAuth, getUnreadCount);
router.route("/read/:notificationId").patch(userAuth, markAsRead);
router.route("/read-all").patch(userAuth, markAllAsRead);
router.route("/:notificationId").delete(userAuth, deleteNotification);
router.route("/delete-read").delete(userAuth, deleteAllRead);
router.route("/event/:eventId/announce").post(userAuth, isOrganizer, sendEventAnnouncement);

export default router;