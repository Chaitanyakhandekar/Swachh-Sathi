import mongoose from "mongoose";
import dotenv from "dotenv"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config({path:"./.env"})

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
    },
    avtar:{
        type:String,
        default:"https://static.vecteezy.com/system/resources/previews/024/983/914/non_2x/simple-user-default-icon-free-png.png"
    },
    bio:{
        type:String,
        default:""
    },
    refreshToken:{
        type:String,
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    role:{
        type:String,
        enum:["USER","ORGANIZER","ADMIN"],
        default:"USER"
    },
    credits:{
        type:Number,
        default:0
    },
    city:{
        type:String,
        default:""
    },
    badges:[{
        type:String,
        enum:["FIRST_EVENT","TOP_VOLUNTEER","CLEAN_CHAMPION","ECO_WARRIOR",""],
        default:""
    }]
},
{timestamps:true})

userSchema.pre("save" , async function(){

    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password,10)
    

})

userSchema.methods.isCorrectPassword = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            name:this.name,
            email:this.email,
            role:this.role
        },
        process.env.JWT_ACCESS_SECRET,
        {expiresIn:process.env.EXPIRES_IN_ACCESS_TOKEN}
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            role:this.role
        },
        process.env.JWT_ACCESS_SECRET,
        {expiresIn:process.env.EXPIRES_IN_REFRESH_TOKEN}
    )
}

export const User = mongoose.model("User",userSchema);