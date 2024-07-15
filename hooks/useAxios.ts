import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance } from "axios";
import { API_HOST } from "@env";
import { getToken } from "@/utils/tokenHelpers";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${API_HOST}`,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshAccessToken = async () => {
  try {
    const refreshToken = await getToken("refreshToken");
    console.log("Refresh Token: (useAxios.ts)", refreshToken);

    if (!refreshToken) {
      console.log("No refresh token available, skipping token refresh.");
      return null;
    }

    const response = await axios.post(`${API_HOST}/api/auth/refreshtoken`, {
      refreshToken,
    });

    await AsyncStorage.setItem("accessToken", response.data.accessToken);
    return response.data.accessToken;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error;
  }
};

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getToken("accessToken");
    console.log("Access Token: (useAxios.ts)", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshAccessToken();
        if (!newAccessToken) {
          return Promise.reject(error);
        }
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Failed to refresh access token:", refreshError);
      }
    } else if (error.response.status === 401) {
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
    }

    return Promise.reject(error);
  }
);

export const callApi = async (
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  url: string,
  data?: any
) => {
  try {
    const response = await axiosInstance({
      method,
      url,
      data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const useAxios = () => {
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newAccessToken = await refreshAccessToken();
            if (!newAccessToken) {
              return Promise.reject(error);
            }
            axios.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            console.error("Failed to refresh access token:", refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, []);

  return { callApi };
};
