import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    date:{
        type:Date,
        required:true
    },
    startTime:{
        type:String,
        required:true
    },
    endTime:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:["UPCOMING","ONGOING","COMPLETED","CANCELLED"],
        default:"UPCOMING"
    },
    locationId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Location",
        required:true
    },
    organizerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    location:{
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number],
        }
    },
    volunteersCount:{
        type:Number,
        default:0
    },
    maxVolunteers:{
        type:Number,
        default:100
    },
    creditsReward:{
        type:Number,
        default:10
    },
    images:[{
        type:String
    }],
    isVerified:{
        type:Boolean,
        default:false
    },
    qrCode:{
        type:String,
        default:null
    },
    wasteCollectedKg:{
        type:Number,
        default:0
    },
    co2ImpactKg:{
        type:Number,
        default:0
    }
},
{timestamps:true})

eventSchema.index({ "location": "2dsphere" });

export const Event = mongoose.model("Event",eventSchema);