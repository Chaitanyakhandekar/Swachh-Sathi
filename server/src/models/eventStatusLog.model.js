import mongoose from "mongoose";

const eventStatusLogSchema = new mongoose.Schema({
    eventId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Event",
        required:true
    },
    changedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    previousStatus:{
        type:String,
        enum:["UPCOMING","ONGOING","COMPLETED","CANCELLED"]
    },
    newStatus:{
        type:String,
        enum:["UPCOMING","ONGOING","COMPLETED","CANCELLED"],
        required:true
    },
    reason:{
        type:String,
        trim:true
    }
},
{timestamps:true})

eventStatusLogSchema.index({ eventId: 1 });

export const EventStatusLog = mongoose.model("EventStatusLog",eventStatusLogSchema);