import axios from "axios";

class LocationApi{
    constructor(){
        this.baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL}/api/locations`
    }

    createLocation = async (locationData) => {
        try {
            const response = await axios.post(`${this.baseUrl}/create`, locationData, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    getAllLocations = async (params = {}) => {
        try {
            const response = await axios.get(`${this.baseUrl}/all`, { params });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    getNearbyLocations = async (params = {}) => {
        try {
            const response = await axios.get(`${this.baseUrl}/nearby`, { params });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    getLocationById = async (locationId) => {
        try {
            const response = await axios.get(`${this.baseUrl}/${locationId}`);
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    updateLocation = async (locationId, locationData) => {
        try {
            const response = await axios.put(`${this.baseUrl}/${locationId}`, locationData, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    deleteLocation = async (locationId) => {
        try {
            const response = await axios.delete(`${this.baseUrl}/${locationId}`, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }
}

export const locationApi = new LocationApi();