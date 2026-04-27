import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiUtils.js";

const isOrganizer = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized User");
    }

    if (req.user.role !== "ORGANIZER" && req.user.role !== "ADMIN") {
        throw new ApiError(403, "Access denied. Organizer or Admin only.");
    }

    next();
});

export { isOrganizer };