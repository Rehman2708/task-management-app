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
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data as UploadResponse;
    } catch (error: any) {
      console.error("Upload error: ", error.response?.data || error.message);
      throw error;
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
