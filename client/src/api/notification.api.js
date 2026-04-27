import axios from "axios";

class NotificationApi {
    constructor() {
        this.baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL}/api/notifications`;
    }

    getNotifications = async (params = {}) => {
        try {
            const response = await axios.get(`${this.baseUrl}/all`, { params, withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    getUnreadCount = async () => {
        try {
            const response = await axios.get(`${this.baseUrl}/unread-count`, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    markAsRead = async (notificationId) => {
        try {
            const response = await axios.patch(`${this.baseUrl}/read/${notificationId}`, {}, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    markAllAsRead = async () => {
        try {
            const response = await axios.patch(`${this.baseUrl}/read-all`, {}, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    deleteNotification = async (notificationId) => {
        try {
            const response = await axios.delete(`${this.baseUrl}/${notificationId}`, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    deleteAllRead = async () => {
        try {
            const response = await axios.delete(`${this.baseUrl}/delete-read`, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    createNotification = async (data) => {
        try {
            const response = await axios.post(this.baseUrl, data, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    sendEventAnnouncement = async (eventId, data) => {
        try {
            const response = await axios.post(`${this.baseUrl}/event/${eventId}/announce`, data, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }
}

export const notificationApi = new NotificationApi();