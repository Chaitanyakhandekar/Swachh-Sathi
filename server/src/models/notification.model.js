import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema({
    sender: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    receivers: [{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }],
    recipient: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    entity: {
        type: mongoose.Types.ObjectId
    },
    type: {
        type: String,
        enum: [
            "group_add",
            "mention",
            "message",
            "admin_promote",
            "EVENT_JOINED",
            "EVENT_COMPLETED",
            "EVENT_CANCELLED",
            "EVENT_REMINDER",
            "CREDITS_EARNED",
            "ATTENDANCE_MARKED",
            "NEW_EVENT",
            "ROLE_UPDATED",
            "EVENT_STARTING_SOON",
            "EVENT_ANNOUNCEMENT",
            "SYSTEM"
        ]
    },
    isGroupNotification: {
        type: Boolean,
        default: false
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    content: {
        type: String,
        required: true
    },
    renderUrl: {
        type: String
    },
    readBy: [{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }],
    title: {
        type: String
    },
    priority: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
        default: "MEDIUM"
    }
}, { timestamps: true })

notificationSchema.index({ recipient: 1, createdAt: -1 })
notificationSchema.index({ receivers: 1, createdAt: -1 })
notificationSchema.index({ readBy: 1 })
notificationSchema.index({ type: 1 })

export const Notification = mongoose.model("Notification", notificationSchema)