import mongoose from "mongoose";

const eventVolunteerSchema = new mongoose.Schema({
    eventId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Event",
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    status:{
        type:String,
        enum:["JOINED","PRESENT","ABSENT"],
        default:"JOINED"
    },
    joinedAt:{
        type:Date,
        default:Date.now
    },
    attendanceMarkedAt:{
        type:Date
    }
},
{timestamps:true})

eventVolunteerSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const EventVolunteer = mongoose.model("EventVolunteer",eventVolunteerSchema);