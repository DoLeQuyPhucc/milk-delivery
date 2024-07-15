import { useEffect, useState } from "react";
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
        const response = await callApi("GET", "/api/auth/me");
        console.log("User response (useAuth): ", response);

        if (response) {
          dispatch(setUser(response));
        } else {
          console.log(
            "No valid token found or user profile could not be fetched."
          );
        }
      } catch (error) {
        console.error("Failed to fetch user profile (23):", error);
      } finally {
        setLoading(false);
      }
    };
    checkTokensAndFetchUser();
  }, [dispatch]);

  return { loading };
};

export default useAuth;
