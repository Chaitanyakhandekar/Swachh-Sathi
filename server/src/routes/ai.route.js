import Router from "express";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/apiUtils.js";
import { getAIResponse } from "../controllers/ai.controller.js";


const router = Router();


router.route("/chat").post(userAuth, getAIResponse


);

export default router;