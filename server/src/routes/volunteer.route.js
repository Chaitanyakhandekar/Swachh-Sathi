import Router from "express";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import { isOrganizer } from "../middlewares/organizer.middleware.js";
import {
    joinEvent,
    leaveEvent,
    getEventVolunteers,
    markAttendance,
    getMyVolunteerEvents
} from "../controllers/volunteer.controller.js";

const router = Router();

router.route("/:eventId/join").post(userAuth, joinEvent);
router.route("/:eventId/leave").post(userAuth, leaveEvent);
router.route("/:eventId/volunteers").get(userAuth, getEventVolunteers);
router.route("/mark-attendance").post(userAuth, isOrganizer, markAttendance);
router.route("/my-events").get(userAuth, getMyVolunteerEvents);

export default router;