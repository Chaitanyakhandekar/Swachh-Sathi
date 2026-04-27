import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/apiUtils.js";
import { Event } from "../models/event.model.js";
import { EventStatusLog } from "../models/eventStatusLog.model.js";
import { EventVolunteer } from "../models/eventVolunteer.model.js";
import { User } from "../models/user.model.js";
import { cacheService } from "../services/cache.service.js";
import { notifyMultipleRealTime } from "../services/notification.service.js";

const verifyEventCompletion = asyncHandler(async (req, res) => {
    const { eventId, status, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Valid event ID is required.");
    }

    if (!status || !["COMPLETED", "CANCELLED"].includes(status)) {
        throw new ApiError(400, "Status must be COMPLETED or CANCELLED.");
    }

    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    if (event.status === status) {
        throw new ApiError(400, `Event is already ${status}.`);
    }

    const previousStatus = event.status;
    event.status = status;
    event.isVerified = true;
    await event.save();

    await EventStatusLog.create({
        eventId,
        changedBy: req.user._id,
        previousStatus,
        newStatus: status,
        reason: reason || ""
    });

    if (status === "COMPLETED") {
        const volunteers = await EventVolunteer.find({ eventId }).populate('userId');
        const recipientIds = volunteers.map(v => v.userId._id);
        const creditAmount = event.creditsReward;

        for (const vol of volunteers) {
            if (vol.userId) {
                await User.updateOne(
                    { _id: vol.userId._id },
                    { $inc: { credits: creditAmount } }
                );
            }
        }

        await notifyMultipleRealTime({
            recipients: recipientIds,
            type: "CREDITS_EARNED",
            title: "Credits Earned! ⭐",
            content: `You earned ${creditAmount} credits for participating in "${event.title}"`,
            data: { eventId, url: `/event/${eventId}` }
        });
    }

    await cacheService.invalidateEventCache(eventId);

    return res.status(200).json(new ApiResponse(200, event, `Event ${status.toLowerCase()} verified successfully.`));
});

const changeEventStatus = asyncHandler(async (req, res) => {
    const { eventId, status, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Valid event ID is required.");
    }

    if (!status || !["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"].includes(status)) {
        throw new ApiError(400, "Invalid status.");
    }

    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    const previousStatus = event.status;
    event.status = status;
    if (status === "COMPLETED") {
        event.isVerified = true;
    }
    await event.save();

    await EventStatusLog.create({
        eventId,
        changedBy: req.user._id,
        previousStatus,
        newStatus: status,
        reason: reason || ""
    });

    if (status === "COMPLETED") {
        const volunteers = await EventVolunteer.find({ eventId }).populate('userId');
        const recipientIds = volunteers.map(v => v.userId._id);
        const creditAmount = event.creditsReward;

        for (const vol of volunteers) {
            if (vol.userId) {
                await User.updateOne(
                    { _id: vol.userId._id },
                    { $inc: { credits: creditAmount } }
                );
            }
        }

        await notifyMultipleRealTime({
            recipients: recipientIds,
            type: "CREDITS_EARNED",
            title: "Credits Earned! ⭐",
            content: `You earned ${creditAmount} credits for participating in "${event.title}"`,
            data: { eventId, url: `/event/${eventId}` }
        });
    }

    if (status === "CANCELLED") {
        const volunteers = await EventVolunteer.find({ eventId }).populate('userId');
        const recipientIds = volunteers.map(v => v.userId._id);

        await notifyMultipleRealTime({
            recipients: recipientIds,
            type: "EVENT_CANCELLED",
            title: "Event Cancelled 😔",
            content: `The event "${event.title}" has been cancelled.`,
            data: { eventId, url: `/event/${eventId}` }
        });
    }

    await cacheService.invalidateEventCache(eventId);

    return res.status(200).json(new ApiResponse(200, event, "Event status changed successfully."));
});

const getEventStatusHistory = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Valid event ID is required.");
    }

    const logs = await EventStatusLog.find({ eventId })
        .populate("changedBy", "name username role")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, logs, "Status history fetched successfully."));
});

const getLeaderboard = asyncHandler(async (req, res) => {
    const { limit = 50 } = req.query;

    const leaderboard = await User.find()
        .select("name username avatar credits city badges")
        .sort({ credits: -1 })
        .limit(parseInt(limit));

    return res.status(200).json(new ApiResponse(200, leaderboard, "Leaderboard fetched successfully."));
});

const getStats = asyncHandler(async (req, res) => {
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({ status: "UPCOMING" });
    const completedEvents = await Event.countDocuments({ status: "COMPLETED" });
    const totalVolunteers = await EventVolunteer.distinct("userId");
    const totalCredits = await User.aggregate([{ $group: { _id: null, total: { $sum: "$credits" } } }]);

    const stats = {
        totalEvents,
        upcomingEvents,
        completedEvents,
        totalVolunteers: totalVolunteers.length,
        totalCredits: totalCredits[0]?.total || 0
    };

    return res.status(200).json(new ApiResponse(200, stats, "Stats fetched successfully."));
});

const updateUserRole = asyncHandler(async (req, res) => {
    const { userId, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Valid user ID is required.");
    }

    if (!role || !["USER", "ORGANIZER", "ADMIN"].includes(role)) {
        throw new ApiError(400, "Role must be USER, ORGANIZER, or ADMIN.");
    }

    const user = await User.findByIdAndUpdate(userId, { $set: { role } }, { new: true }).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    if (user._id.toString() !== req.user._id.toString()) {
        await User.populate(user, { path: "notificationSettings" });
    }

    return res.status(200).json(new ApiResponse(200, user, "User role updated successfully."));
});

export {
    verifyEventCompletion,
    changeEventStatus,
    getEventStatusHistory,
    getLeaderboard,
    getStats,
    updateUserRole
};