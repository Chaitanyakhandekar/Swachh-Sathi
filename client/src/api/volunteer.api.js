import axios from "axios";

class VolunteerApi{
    constructor(){
        this.baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL}/api/volunteers`
    }

    joinEvent = async (eventId) => {
        try {
            const response = await axios.post(`${this.baseUrl}/${eventId}/join`, {}, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    leaveEvent = async (eventId) => {
        try {
            const response = await axios.post(`${this.baseUrl}/${eventId}/leave`, {}, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    getEventVolunteers = async (eventId, params = {}) => {
        try {
            const response = await axios.get(`${this.baseUrl}/${eventId}/volunteers`, { params, withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    markAttendance = async (data) => {
        try {
            const response = await axios.post(`${this.baseUrl}/mark-attendance`, data, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    getMyVolunteerEvents = async (params = {}) => {
        try {
            const response = await axios.get(`${this.baseUrl}/my-events`, { params, withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }
}

export const volunteerApi = new VolunteerApi();