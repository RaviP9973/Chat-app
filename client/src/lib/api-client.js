import axios from "axios"

const apiClient = axios.create({
    baseURL: window.location.origin,
    withCredentials: true,
})
export default apiClient;