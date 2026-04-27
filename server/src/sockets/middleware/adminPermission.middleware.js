import { socketEvents } from "../../constants/socketEvents.js"
import { isChatExists } from "../../utils/document existance check/chat.js"
import { Chat } from "../../models/chat.model.js"

export const adminPermission = async(socket)=>{
   const groupId = socket?.groupId

   if(!groupId){
    socket.to(socket.user._id).emit(socketEvents.ERROR, {
        type:"Permission",
        message:"User Not Authorize for This Action"
    })
   }else{

    const group = await isChatExists(groupId)

    if(!group){
        console.log("Not Exists")
    }

    
    if(group?.isGroupChat)
        console.log("Checking ::::::::::::::::::::::::::::::::::::",group.admins , " user ",socket?.user?._id)
        if(group.admins.some(a => a.toString() === socket?.user?._id.toString())){
            console.log("Checking ::::::::::::::::::::::::::::::::::::")
            socket.group = group
           
        }
    }
}