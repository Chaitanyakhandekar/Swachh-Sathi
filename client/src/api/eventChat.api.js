import axios from "axios";

const baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL}/api/event-chats`;

const eventChatApi = {
    getChat: async (eventId) => {
        try {
            const response = await axios.get(`${baseUrl}/${eventId}`, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    },

    getMessages: async (eventId, params = {}) => {
        try {
            const response = await axios.get(`${baseUrl}/${eventId}/messages`, { params, withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    },

    sendMessage: async (eventId, content) => {
        try {
            const response = await axios.post(`${baseUrl}/${eventId}/messages`, { content }, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    },

    deleteMessage: async (eventId, messageId) => {
        try {
            const response = await axios.delete(`${baseUrl}/${eventId}/messages/${messageId}`, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }
};

export default eventChatApi;