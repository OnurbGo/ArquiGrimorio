import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  //LEMBRAR DE MUDAR O IP
  baseURL: `${process.env.BASE_URL}`,
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
