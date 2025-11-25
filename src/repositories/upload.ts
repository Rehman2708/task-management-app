import axios from "axios";
import { AppUrl } from "../utils/appUrl";

export interface UploadResponse {
  key: string;
  url: string;
  type: "image" | "video";
}

export class UploadRepo {
  static async uploadFile(file: any): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    try {
      const res = await axios.post(AppUrl.uploadFile, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 20000, // 20 sec timeout
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      return res.data as UploadResponse;
    } catch (error: any) {
      // Handle no internet
      if (error.message === "Network Error") {
        throw new Error("NETWORK");
      }

      // Handle timeout
      if (error.code === "ECONNABORTED") {
        throw new Error("TIMEOUT");
      }

      throw new Error("UNKNOWN");
    }
  }

  static async deleteFile(uri: string) {
    try {
      const url = AppUrl.deleteFile(uri);
      const res = await axios.delete(url);
      return res.data;
    } catch (error: any) {
      console.error("Delete error: ", error.response?.data || error.message);
      throw error;
    }
  }
}
