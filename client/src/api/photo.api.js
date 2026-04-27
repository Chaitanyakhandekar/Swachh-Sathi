import axios from "axios";

class PhotoApi{
    constructor(){
        this.baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL}/api/photos`
    }

    uploadPhoto = async (eventId, formData) => {
        try {
            const response = await axios.post(`${this.baseUrl}/${eventId}/upload`, formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" }
            });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    getEventPhotos = async (eventId) => {
        try {
            const response = await axios.get(`${this.baseUrl}/${eventId}`, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    deletePhoto = async (photoId) => {
        try {
            const response = await axios.delete(`${this.baseUrl}/${photoId}`, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }
}

export const photoApi = new PhotoApi();