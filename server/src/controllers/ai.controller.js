import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/apiUtils.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendVerificationToken } from "../services/sendVerificationToken.js";
import { generateTokens } from "../services/generateTokens.js";
import { deleteFileFromCloudinary, uploadFileOnCloudinary } from "../services/cloudinary.service.js";
import { generateOTP } from "../services/generateOTP.js";
import { sendEmail } from "../services/brevoMail.service.js";
import { Chat } from "../models/chat.model.js";
import { getIO } from "../sockets/socketInstance.js";
import { socketEvents } from "../constants/socketEvents.js";
import { Message } from "../models/message.model.js";
import { getAIResponseService } from "../services/ai.service.js";



const getAIResponse = asyncHandler(async (req, res) => {

    const prompt = req.body.message

    console.log("PROMPT ::: ", prompt)

    const response = await getAIResponseService(prompt)

    return res
        .status(200)
        .json(
            new ApiResponse(200, response, "Response Got Successfully.")
        )

})

export {
    getAIResponse
}