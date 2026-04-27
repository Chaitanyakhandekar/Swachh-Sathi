import Router from "express";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import { isOrganizer } from "../middlewares/organizer.middleware.js";
import {
    getOrCreateChat,
    getMessages,
    sendMessage,
    deleteMessage
} from "../controllers/eventChat.controller.js";

const router = Router();

router.route("/:eventId").get(userAuth, getOrCreateChat);
router.route("/:eventId/messages").get(userAuth, getMessages);
router.route("/:eventId/messages").post(userAuth, sendMessage);
router.route("/:eventId/messages/:messageId").delete(userAuth, deleteMessage);

export default router;