import Router from "express";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { isOrganizer } from "../middlewares/organizer.middleware.js";
import {
    createLocation,
    getAllLocations,
    getNearbyLocations,
    getLocationById,
    updateLocation,
    deleteLocation
} from "../controllers/location.controller.js";

const router = Router();

router.route("/create").post(userAuth, isOrganizer, createLocation);
router.route("/all").get(getAllLocations);
router.route("/nearby").get(getNearbyLocations);
router.route("/:locationId").get(getLocationById);
router.route("/:locationId").put(userAuth, isOrganizer, updateLocation);
router.route("/:locationId").delete(userAuth, isAdmin, deleteLocation);

export default router;