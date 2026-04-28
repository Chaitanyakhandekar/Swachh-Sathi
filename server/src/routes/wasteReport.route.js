import Router from "express";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    createWasteReport,
    getWasteReports,
    getMyReports,
    updateReportStatus,
    deleteReport,
    getWasteStats
} from "../controllers/wasteReport.controller.js";

const router = Router();

router.route("/report").post(userAuth, upload.single("image"), createWasteReport);
router.route("/all").get(getWasteReports);
router.route("/my-reports").get(userAuth, getMyReports);
router.route("/stats").get(getWasteStats);
router.route("/:reportId/status").put(userAuth, updateReportStatus);
router.route("/:reportId").delete(userAuth, deleteReport);

export default router;