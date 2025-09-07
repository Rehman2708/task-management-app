import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeDataInAsyncStorage = async <T>(key: string, data: T) => {
  let error;
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    error = err;
  }
  return {
    success: !error,
    error,
  };
};

export const getDataFromAsyncStorage = async <T>(key: string) => {
  let data: T | string | null = null;
  let error;
  try {
    const rawData = await AsyncStorage.getItem(key);
    if (rawData) {
      data = JSON.parse(rawData) as T;
    }
  } catch (err) {
    error = err;
  }
  return {
    success: !error,
    error,
    data,
  };
};

export const clearAsyncStorage = async () => {
  let error;
  try {
    await AsyncStorage.clear();
  } catch (err) {
    error = err;
  }
  return {
    success: !error,
    error,
    data: "Async storage is clear",
  };
};
