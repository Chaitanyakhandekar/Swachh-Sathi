import axios from "axios";

class MessageApi{
    constructor(){
        this.baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL}/api/messages`
    }

    getConversation = async (otherUserId) =>{
        try {
            console.log("Messages in Conversation :: ")
            const response = await axios.get(`${this.baseUrl}/convo/${otherUserId}`,
                {
                    withCredentials:true
                }
            )

            console.log("Messages in Conversation :: ")

            return {
                success:true,
                message:"",
                data:response.data || []
            }
        } catch (error) {
            return {
                success:false,
                message:error.message,
                error:error
            }
        }
    }

    uploadImages = async (FormData)=>{
        try {
            
            const response = await axios.post(`
                ${this.baseUrl}/upload-images`,
                FormData,
                {
                    withCredentials:true,
                    headers:{
                        "Content-Type":"multipart/form-data"
                    }
                }
            )

            console.log("Upload Response :: ",response.data)

            return{
                success:true,
                data:response.data.data,
                message:"Images Upload Done"
            }

        } catch (error) {
            return {
                success:false,
                message:"Upload Failed",
                error:error.message
            }
        }
    }

    deleteForMe = async (messageId) =>{
        try {
            const response = await axios.delete(`${this.baseUrl}/for-me/${messageId}`,
                {
                    withCredentials:true
                }
            )
             console.log("Delete for me response :: ",response.data)

            return {
                success:true,
                data:response.data.data,
                message:"Message deleted for me successfully."
            }
        } catch (error) {
            return{
                success:false,
                message:error.message,
                error:error
            }
        }
    }
    
    deleteForEveryone = async (messageId) =>{
        try {
            const response = await axios.delete(`${this.baseUrl}/for-everyone/${messageId}`,
                {
                    withCredentials:true
                }
            )
             console.log("Delete for Everyone response :: ",response.data)

            return {
                success:true,
                data:response.data.data,
                message:"Message deleted for everyone successfully."
            }
        } catch (error) {
            return{
                success:false,
                message:error.message,
                error:error
            }
        }
    }

}

export const messageApi = new MessageApi()