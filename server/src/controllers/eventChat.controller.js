import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/apiUtils.js";
import { EventChat } from "../models/eventChat.model.js";
import { Event } from "../models/event.model.js";
import { EventVolunteer } from "../models/eventVolunteer.model.js";

const getOrCreateChat = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Valid event ID is required.");
    }

    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    let chat = await EventChat.findOne({ eventId });
    if (!chat) {
        chat = await EventChat.create({ eventId });
    }

    return res.status(200).json(new ApiResponse(200, chat, "Chat fetched successfully."));
});

const getChatAccess = async (user, eventId) => {
    const event = await Event.findById(eventId);
    if (!event) return null;

    const isOrganizer = event.organizerId?.toString() === user._id.toString();
    const isAdmin = user.role === "ADMIN";

    if (isOrganizer || isAdmin) return { canAccess: true, isOrganizer: true };

    const volunteer = await EventVolunteer.findOne({ eventId, userId: user._id, status: { $in: ["JOINED", "PRESENT"] } });
    if (volunteer) return { canAccess: true, isOrganizer: false };

    return { canAccess: false, isOrganizer: false };
};

const getMessages = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Valid event ID is required.");
    }

    const access = await getChatAccess(req.user, eventId);
    if (!access.canAccess) {
        throw new ApiError(403, "Only volunteers and organizer can access this chat.");
    }

    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    const isClosed = event.status === "COMPLETED" || event.status === "CANCELLED";

    const chat = await EventChat.findOne({ eventId })
        .populate("messages.sender", "name username avatar");

    const messages = chat?.messages || [];
    const total = messages.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedMessages = messages.slice().reverse().slice(skip, skip + parseInt(limit));

    return res.status(200).json(new ApiResponse(200, {
        messages: paginatedMessages,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        isClosed,
        isOrganizer: access.isOrganizer
    }, "Messages fetched successfully."));
});

const sendMessage = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Valid event ID is required.");
    }

    if (!content || !content.trim()) {
        throw new ApiError(400, "Message content is required.");
    }

    const access = await getChatAccess(req.user, eventId);
    if (!access.canAccess) {
        throw new ApiError(403, "Only volunteers and organizer can send messages.");
    }

    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    if (event.status === "COMPLETED" || event.status === "CANCELLED") {
        throw new ApiError(400, "Chat is closed for this event.");
    }

    let chat = await EventChat.findOne({ eventId });
    if (!chat) {
        chat = await EventChat.create({ eventId });
    }

    const newMessage = {
        sender: req.user._id,
        content: content.trim(),
        createdAt: new Date()
    };

    chat.messages.push(newMessage);
    chat.lastMessage = newMessage;
    await chat.save();

    await chat.populate("messages.sender", "name username avatar");

    const io = req.app.get("io");
    if (io) {
        io.to(`chat:${eventId}`).emit("newMessage", { eventId, message: chat.messages[chat.messages.length - 1] });
    }

    return res.status(201).json(new ApiResponse(201, chat.messages[chat.messages.length - 1], "Message sent successfully."));
});

const deleteMessage = asyncHandler(async (req, res) => {
    const { eventId, messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(messageId)) {
        throw new ApiError(400, "Valid IDs are required.");
    }

    const access = await getChatAccess(req.user, eventId);
    if (!access.canAccess) {
        throw new ApiError(403, "Only volunteers and organizer can access this chat.");
    }

    const chat = await EventChat.findOne({ eventId });
    if (!chat) {
        throw new ApiError(404, "Chat not found.");
    }

    const message = chat.messages.id(messageId);
    if (!message) {
        throw new ApiError(404, "Message not found.");
    }

    const isMessageOwner = message.sender?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "ADMIN";

    if (!isMessageOwner && !isAdmin) {
        throw new ApiError(403, "You can only delete your own messages.");
    }

    message.isDeleted = true;
    message.content = "This message has been deleted";
    await chat.save();

    const io = req.app.get("io");
    if (io) {
        io.to(`chat:${eventId}`).emit("messageDeleted", { eventId, messageId });
    }

    return res.status(200).json(new ApiResponse(200, null, "Message deleted successfully."));
});

export {
    getOrCreateChat,
    getMessages,
    sendMessage,
    deleteMessage
};