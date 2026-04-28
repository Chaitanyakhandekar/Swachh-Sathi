import Router from "express";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/apiUtils.js";
import { getAIResponse } from "../services/ai.service.js";

const router = Router();

const chatWithAI = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message || !message.trim()) {
        throw new ApiError(400, "Message is required.");
    }

    const result = await getAIResponse(message);

    if (!result.success) {
        throw new ApiError(500, "Failed to get response from AI.");
    }

    return res.status(200).json(new ApiResponse(200, { response: result.response }, "AI response fetched successfully."));
});

router.route("/chat").post(userAuth, chatWithAI);

export default router;