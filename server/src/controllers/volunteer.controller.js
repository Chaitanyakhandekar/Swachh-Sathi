import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/apiUtils.js";
import { EventVolunteer } from "../models/eventVolunteer.model.js";
import { Event } from "../models/event.model.js";
import { User } from "../models/user.model.js";
import { cacheService } from "../services/cache.service.js";
import { createRealTimeNotification } from "../services/notification.service.js";

const joinEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Valid event ID is required.");
    }

    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    if (event.status !== "UPCOMING" && event.status !== "ONGOING") {
        throw new ApiError(400, "Cannot join this event. Registration closed.");
    }

    if (event.volunteersCount >= event.maxVolunteers) {
        throw new ApiError(400, "Event is full.");
    }

    const existingJoin = await EventVolunteer.findOne({ eventId, userId: req.user._id });
    if (existingJoin) {
        throw new ApiError(400, "You have already joined this event.");
    }

    await EventVolunteer.create({ eventId, userId: req.user._id });
    await Event.findByIdAndUpdate(eventId, { $inc: { volunteersCount: 1 } });

    // Notify organizer
    await createRealTimeNotification({
        recipient: event.organizerId,
        type: "EVENT_JOINED",
        title: "New Volunteer! 🎉",
        content: `${req.user.name} has joined your event "${event.title}"`,
        data: { eventId, url: `/event/${eventId}` }
    });

    await cacheService.invalidateEventCache(eventId);

    return res.status(201).json(new ApiResponse(201, null, "Successfully joined the event."));
});

const leaveEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Valid event ID is required.");
    }

    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    if (event.status !== "UPCOMING") {
        throw new ApiError(400, "Cannot leave event after it has started.");
    }

    const volunteer = await EventVolunteer.findOne({ eventId, userId: req.user._id });
    if (!volunteer) {
        throw new ApiError(400, "You have not joined this event.");
    }

    await EventVolunteer.deleteOne({ _id: volunteer._id });
    await Event.findByIdAndUpdate(eventId, { $inc: { volunteersCount: -1 } });

    await cacheService.invalidateEventCache(eventId);

    return res.status(200).json(new ApiResponse(200, null, "Successfully left the event."));
});

const getEventVolunteers = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { status } = req.query;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Valid event ID is required.");
    }

    const filter = { eventId };
    if (status) filter.status = status;

    const volunteers = await EventVolunteer.find(filter)
        .populate("userId", "name username avatar city credits")
        .sort({ joinedAt: -1 });

    return res.status(200).json(new ApiResponse(200, volunteers, "Volunteers fetched successfully."));
});

const markAttendance = asyncHandler(async (req, res) => {
    const { eventId, userId, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Valid event ID and user ID are required.");
    }

    if (!status || !["PRESENT", "ABSENT"].includes(status)) {
        throw new ApiError(400, "Status must be PRESENT or ABSENT.");
    }

    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    const volunteer = await EventVolunteer.findOne({ eventId, userId });
    if (!volunteer) {
        throw new ApiError(404, "Volunteer not found.");
    }

    volunteer.status = status;
    volunteer.attendanceMarkedAt = new Date();
    await volunteer.save();

    // Note: Credits will be added when event is marked as COMPLETED, not here
    // This prevents duplicate credit issues

    return res.status(200).json(new ApiResponse(200, volunteer, `Attendance marked as ${status}. Credits will be awarded when event is completed.`));
});

const getMyVolunteerEvents = asyncHandler(async (req, res) => {
    const { status } = req.query;

    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const events = await EventVolunteer.find(filter)
        .populate({
            path: "eventId",
            populate: [
                { path: "locationId", select: "name address city" },
                { path: "organizerId", select: "name username" }
            ]
        })
        .sort({ joinedAt: -1 });

    return res.status(200).json(new ApiResponse(200, events, "Your volunteer events fetched successfully."));
});

export {
    joinEvent,
    leaveEvent,
    getEventVolunteers,
    markAttendance,
    getMyVolunteerEvents
};