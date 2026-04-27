import axios from "axios";

class EventApi{
    constructor(){
        this.baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL}/api/events`
    }

    createEvent = async (eventData) => {
        try {
            const response = await axios.post(`${this.baseUrl}/create`, eventData, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    getAllEvents = async (params = {}) => {
        try {
            const response = await axios.get(`${this.baseUrl}/all`, { params, withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    getNearbyEvents = async (params = {}) => {
        try {
            const response = await axios.get(`${this.baseUrl}/nearby`, { params });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    getEventsByCity = async (city) => {
        try {
            const response = await axios.get(`${this.baseUrl}/city`, { params: { city } });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    getEventById = async (eventId) => {
        try {
            const response = await axios.get(`${this.baseUrl}/${eventId}`, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    updateEvent = async (eventId, eventData) => {
        try {
            const response = await axios.put(`${this.baseUrl}/${eventId}`, eventData, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    deleteEvent = async (eventId) => {
        try {
            const response = await axios.delete(`${this.baseUrl}/${eventId}`, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    getMyEvents = async () => {
        try {
            const response = await axios.get(`${this.baseUrl}/my-events`, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }
}

export const eventApi = new EventApi();