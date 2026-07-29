import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const userId = import.meta.env.VITE_DEV_USER_ID || "1";
  config.headers["X-User-Id"] = userId;
  return config;
});

export default client;
