import axios from "axios";

class WasteReportApi {
    constructor() {
        this.baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL}/api/waste`;
    }

    createReport = async (formData) => {
        try {
            const response = await axios.post(`${this.baseUrl}/report`, formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" }
            });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    };

    getReports = async (params = {}) => {
        try {
            const response = await axios.get(`${this.baseUrl}/all`, { params });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    };

    getMyReports = async (status) => {
        try {
            const response = await axios.get(`${this.baseUrl}/my-reports`, { 
                params: { status },
                withCredentials: true 
            });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    };

    getStats = async () => {
        try {
            const response = await axios.get(`${this.baseUrl}/stats`);
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    };

    updateStatus = async (reportId, status, eventId) => {
        try {
            const response = await axios.put(`${this.baseUrl}/${reportId}/status`, { status, eventId }, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    };

    deleteReport = async (reportId) => {
        try {
            const response = await axios.delete(`${this.baseUrl}/${reportId}`, { withCredentials: true });
            return { success: true, message: response.data.message, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    };
}

export const wasteReportApi = new WasteReportApi();