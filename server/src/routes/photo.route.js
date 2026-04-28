import Router from "express";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    uploadEventPhoto,
    uploadBeforeAfterPhoto,
    getBeforeAfterPairs,
    getEventPhotos,
    deleteEventPhoto
} from "../controllers/photo.controller.js";

const router = Router();

router.route("/:eventId/upload").post(userAuth, upload.single("image"), uploadEventPhoto);
router.route("/:eventId/upload-before-after").post(userAuth, upload.single("image"), uploadBeforeAfterPhoto);
router.route("/:eventId/before-after").get(getBeforeAfterPairs);
router.route("/:eventId").get(getEventPhotos);
router.route("/:photoId").delete(userAuth, deleteEventPhoto);

export default router;