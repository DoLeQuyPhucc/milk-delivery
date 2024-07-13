import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/slices/userSlice";
import { callApi } from "@/hooks/useAxios";
import { AppDispatch } from "@/redux/store/store";

const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const checkTokensAndFetchUser = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        console.log("Access Token: (useAuth.ts)", accessToken);
        console.log("Refresh Token: (useAuth.ts)", refreshToken);
        
        if (accessToken && refreshToken) {
          const userProfile = await fetchUserProfile();
          if (userProfile) {
            dispatch(setUser(userProfile));
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    checkTokensAndFetchUser();
  }, [dispatch]);

  const fetchUserProfile = async () => {
    try {
      const response = await callApi("GET", "/api/auth/me");
      return response;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      return null;
    }
  };

  return { loading };
};

export default useAuth;
