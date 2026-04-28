import mongoose from "mongoose";

const wasteReportSchema = new mongoose.Schema({
    reportedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    locationId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Location"
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    imageUrl:{
        type:String,
        default:null
    },
    cloudinaryId:{
        type:String,
        default:null
    },
    wasteType:{
        type:String,
        enum:["PLASTIC","ORGANIC","ELECTRONIC","CONSTRUCTION","MIXED","OTHER"],
        default:"MIXED"
    },
    estimatedQuantity:{
        type:String,
        enum:["SMALL","MEDIUM","LARGE","HUGE"],
        default:"MEDIUM"
    },
    status:{
        type:String,
        enum:["PENDING","VERIFIED","CLEANED","REJECTED"],
        default:"PENDING"
    },
    verifiedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },
    cleanedByEventId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Event",
        default:null
    },
    cleanedAt:{
        type:Date,
        default:null
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
    address:{
        type:String,
        default:null
    }
},
{timestamps:true})

wasteReportSchema.index({ "location": "2dsphere" });
wasteReportSchema.index({ status: 1 });
wasteReportSchema.index({ reportedBy: 1 });

export const WasteReport = mongoose.model("WasteReport",wasteReportSchema);