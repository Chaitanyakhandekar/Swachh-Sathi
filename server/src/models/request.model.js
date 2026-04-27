import mongoose, { mongo, Schema } from "mongoose";

const requestSchema = new Schema({

    type: {
        type: String,
        enum: ["NEW_CHAT", "NEW_GROUP"]
    },
    entityId: {
        type: mongoose.Types.ObjectId,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },
    processedAt: {
        type: Date
    },
    sender: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    receiver: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    isDeleted: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })

requestSchema.index({ receiver: 1, status: 1, createdAt: -1 })
requestSchema.index({ sender: 1 })
requestSchema.index(
    {sender:1, receiver:1 , type:1},
    {unique:true}
)

export const Request = mongoose.model("Request", requestSchema)