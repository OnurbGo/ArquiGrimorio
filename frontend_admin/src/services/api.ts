import axios from "axios";

const DEFAULT_API = "http://localhost:8080";
const rawEnv = (import.meta as any)?.env ?? {};
const API_BASE = (rawEnv.VITE_API_URL as string) || DEFAULT_API;

const normalize = (u: string) => u.replace(/\/+$|\s+/g, "");

const api = axios.create({
  baseURL: normalize(API_BASE),
  headers: { "Content-Type": "application/json" },
});

export const setApiBase = (url: string) => {
  api.defaults.baseURL = normalize(url);
};

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    console.debug("[api] req", config.method, config.baseURL, config.url);
  } catch (err) {
    console.error("[api] request interceptor error", err);
  }
  return config;
});

api.interceptors.response.use(
  (r) => {
    return r;
  },
  (err) => {
    console.error("[api] res error", err?.response?.status, err?.config?.url);
    try {
      if (err?.response?.status === 401) {
        localStorage.removeItem("authToken");
        if (typeof window !== "undefined") window.location.href = "/";
      }
    } catch (e) {
      console.error("[api] response error handler failed", e);
    }
    return Promise.reject(err);
  }
);

export default api;
