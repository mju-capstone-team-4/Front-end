// apiClient.ts
import axios from "axios";
import Constants from "expo-constants";

const { API_URL } = Constants.expoConfig?.extra || {};
const BASE_URL = API_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
