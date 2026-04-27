import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const eventChatSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
        unique: true
    },
    messages: [messageSchema],
    lastMessage: {
        type: messageSchema,
        default: null
    }
}, { timestamps: true });

eventChatSchema.index({ eventId: 1 });
eventChatSchema.index({ 'messages.createdAt': -1 });

export const EventChat = mongoose.model('EventChat', eventChatSchema);