import mongoose from "mongoose";

const eventPhotoSchema = new mongoose.Schema({
    eventId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Event",
        required:true
    },
    uploadedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    imageUrl:{
        type:String,
        required:true
    },
    cloudinaryId:{
        type:String,
        required:true
    },
    caption:{
        type:String,
        trim:true
    }
},
{timestamps:true})

eventPhotoSchema.index({ eventId: 1 });

export const EventPhoto = mongoose.model("EventPhoto",eventPhotoSchema);