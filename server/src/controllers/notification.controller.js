import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/apiUtils.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { createNotificationService } from "../services/notification.service.js";
import { getIO } from "../sockets/socketInstance.js";

const createNotification = asyncHandler(async (req, res) => {
    const {
        receiverId,
        type,
        entityId,
        isGroupChatNotification,
        content,
        renderUrl
    } = req.body;

    const newNotification = await createNotificationService(req.user._id, receiverId, type, entityId, isGroupChatNotification, content, renderUrl);

    return res.status(201).json(new ApiResponse(201, newNotification, "Notification created successfully."));
});

const getNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const userId = req.user._id;

    const filter = {
        $or: [
            { recipient: userId },
            { receivers: userId }
        ]
    };

    if (unreadOnly === "true") {
        filter.isRead = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find(filter)
        .populate("sender", "name username avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
        ...filter,
        isRead: false
    });

    return res.status(200).json(new ApiResponse(200, {
        notifications,
        unreadCount,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
    }, "Notifications fetched successfully."));
});

const markAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        throw new ApiError(400, "Valid notification ID is required.");
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
        throw new ApiError(404, "Notification not found.");
    }

    if (notification.recipient?.toString() !== userId.toString() && !notification.receivers.includes(userId)) {
        throw new ApiError(403, "Access denied.");
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return res.status(200).json(new ApiResponse(200, notification, "Notification marked as read."));
});

const markAllAsRead = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    await Notification.updateMany(
        {
            $or: [
                { recipient: userId },
                { receivers: userId }
            ],
            isRead: false
        },
        {
            $set: { isRead: true, readAt: new Date() }
        }
    );

    return res.status(200).json(new ApiResponse(200, null, "All notifications marked as read."));
});

const deleteNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        throw new ApiError(400, "Valid notification ID is required.");
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
        throw new ApiError(404, "Notification not found.");
    }

    if (notification.recipient?.toString() !== userId.toString() && !notification.receivers.includes(userId)) {
        throw new ApiError(403, "Access denied.");
    }

    await Notification.findByIdAndDelete(notificationId);

    return res.status(200).json(new ApiResponse(200, null, "Notification deleted."));
});

const deleteAllRead = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const result = await Notification.deleteMany({
        $or: [
            { recipient: userId },
            { receivers: userId }
        ],
        isRead: true
    });

    return res.status(200).json(new ApiResponse(200, { deleted: result.deletedCount }, "Read notifications deleted."));
});

const getUnreadCount = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const count = await Notification.countDocuments({
        $or: [
            { recipient: userId },
            { receivers: userId }
        ],
        isRead: false
    });

    return res.status(200).json(new ApiResponse(200, { count }, "Unread count fetched."));
});

const sendEventAnnouncement = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { content, title, priority } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Valid event ID is required.");
    }

    if (!content || !content.trim()) {
        throw new ApiError(400, "Announcement content is required.");
    }

    const { Event } = await import("../models/event.model.js");
    const { EventVolunteer } = await import("../models/eventVolunteer.model.js");

    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    const volunteers = await EventVolunteer.find({ eventId, status: { $in: ["JOINED", "PRESENT"] } });
    const volunteerIds = volunteers.map(v => v.userId);

    if (volunteerIds.length === 0) {
        throw new ApiError(400, "No volunteers found for this event.");
    }

    const notification = await Notification.create({
        sender: req.user._id,
        receivers: volunteerIds,
        entity: eventId,
        type: "EVENT_ANNOUNCEMENT",
        isGroupNotification: true,
        content: content,
        title: title || "Event Announcement",
        priority: priority || "MEDIUM",
        renderUrl: `/event/${eventId}`
    });

    const io = getIO();
    if (io) {
        volunteerIds.forEach(userId => {
            io.to(userId.toString()).emit("notification", notification);
        });
    }

    return res.status(201).json(new ApiResponse(201, notification, "Announcement sent to all volunteers."));
});

export {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    getUnreadCount,
    sendEventAnnouncement
};