import { ApiError } from "../utils/apiUtils.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { isChatExists } from "../utils/document existance check/chat.js"

export const adminPermission = asyncHandler(async(req,res,next)=>{
   const {groupId} = req.body

   if(!groupId){
    throw new ApiError(400,"GroupId is Required")
   }else{

    const group = await isChatExists(groupId)

    if(!group){
        throw new ApiError(400,"GroupId is Required")
    }

    
    if(group?.isGroupChat)
        console.log("Checking ::::::::::::::::::::::::::::::::::::",group.admins , " user ",req.user._id)
        if(group.admins.some(a => a.toString() === req.user._id.toString())){
            console.log("Checking ::::::::::::::::::::::::::::::::::::")
            req.group = group
            next()
        }
    }
})