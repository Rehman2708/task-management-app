import axios from "axios";
import { AppUrl } from "../utils/appUrl";

export interface UploadResponse {
  key: string;
  url: string;
  type: "image" | "video";
}

export class UploadRepo {
  static async uploadFile(
    file: any,
    onProgress?: (percent: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    try {
      const res = await axios.post(AppUrl.uploadFile, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000, // 5 min for large files
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total)
            onProgress(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            );
        },
      });

      return res.data as UploadResponse;
    } catch (error: any) {
      if (error.message === "Network Error") throw new Error("NETWORK");
      if (error.code === "ECONNABORTED") throw new Error("TIMEOUT");
      throw new Error("UNKNOWN");
    }
  }

  static async deleteFile(uri: string) {
    const url = AppUrl.deleteFile(uri);
    const res = await axios.delete(url);
    return res.data;
  }
}
