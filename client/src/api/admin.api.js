import axios from "axios";

class AdminApi{
    constructor(){
        this.baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL}/api/admin`
    }

    verifyEventCompletion = async (data) => {
        try {
            const response = await axios.post(`${this.baseUrl}/verify-event`, data, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    changeEventStatus = async (data) => {
        try {
            const response = await axios.post(`${this.baseUrl}/change-status`, data, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    getEventStatusHistory = async (eventId) => {
        try {
            const response = await axios.get(`${this.baseUrl}/event-history/${eventId}`, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    getLeaderboard = async (params = {}) => {
        try {
            const response = await axios.get(`${this.baseUrl}/leaderboard`, { params });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    getStats = async () => {
        try {
            const response = await axios.get(`${this.baseUrl}/stats`, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    updateUserRole = async (data) => {
        try {
            const response = await axios.post(`${this.baseUrl}/update-role`, data, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }
}

export const adminApi = new AdminApi();