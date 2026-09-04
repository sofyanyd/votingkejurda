import axios from "axios";

// Central API configuration for dynamically resolving backend URL.
// 1. If loaded locally (localhost, 127.0.0.1, or local private IPs like 192.168.x.x, 10.x.x.x, 172.x.x.x),
//    it resolves to the local Express server on port 3000 (enables local network mobile testing).
// 2. If running on public production (Vercel or custom domain), it points to the Railway backend.
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  const isLocal = 
    hostname === "localhost" || 
    hostname === "127.0.0.1" || 
    hostname.startsWith("192.168.") || 
    hostname.startsWith("10.") || 
    hostname.startsWith("172.");
    
  if (isLocal) {
    return `http://${hostname}:3000`;
  }
  
  // Production Railway Backend URL
  return import.meta.env.VITE_API_URL || "https://votingkejurda-production.up.railway.app";
};

export const API_BASE_URL = getApiBaseUrl();

// Automatically attach Bearer token to all requests if it exists in localStorage
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);