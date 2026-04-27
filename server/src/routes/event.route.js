import Router from "express";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import { isOrganizer } from "../middlewares/organizer.middleware.js";
import {
    createEvent,
    getAllEvents,
    getNearbyEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getEventsByCity,
    getMyEvents
} from "../controllers/event.controller.js";

const router = Router();

router.route("/create").post(userAuth, isOrganizer, createEvent);
router.route("/all").get(getAllEvents);
router.route("/nearby").get(getNearbyEvents);
router.route("/city").get(getEventsByCity);
router.route("/my-events").get(userAuth, getMyEvents);
router.route("/:eventId").get(getEventById);
router.route("/:eventId").put(userAuth, isOrganizer, updateEvent);
router.route("/:eventId").delete(userAuth, isOrganizer, deleteEvent);

export default router;