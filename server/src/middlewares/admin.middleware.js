import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiUtils.js";

const isAdmin = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized User");
    }

    if (req.user.role !== "ADMIN") {
        throw new ApiError(403, "Access denied. Admin only.");
    }

    next();
});

export { isAdmin };