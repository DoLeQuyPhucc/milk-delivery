// utils/tokenHelpers.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getToken = async (key: string): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(key);
    return token;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};
