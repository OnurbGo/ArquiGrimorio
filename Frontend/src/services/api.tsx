import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  //LEMBRAR DE MUDAR O IP
  baseURL: "http://10.10.12.96:8080",
  //192.168.224.239 4g
  //192.168.7.179 internet
  //baseURL: "http://192.168.224.239:8081",
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    console.error("Erro ao obter o token do AsyncStorage:", error);
    return config;
  }
});

export default api;
