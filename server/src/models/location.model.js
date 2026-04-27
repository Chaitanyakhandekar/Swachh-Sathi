import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    address:{
        type:String,
        required:true,
        trim:true
    },
    city:{
        type:String,
        required:true,
        trim:true
    },
    state:{
        type:String,
        required:true,
        trim:true
    },
    pincode:{
        type:String,
        trim:true
    },
    location:{
        type:{
            type:String,
            enum:["Point"],
            default:"Point"
        },
        coordinates:{
            type:[Number],
            required:true
        }
    }
},
{timestamps:true})

locationSchema.index({ "location": "2dsphere" });

export const Location = mongoose.model("Location",locationSchema);