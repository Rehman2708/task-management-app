import { ApiService } from "../data/network/apiservices";
import { HttpMethods } from "../data/network/httpMethods";
import { CreateVideoPayload } from "../types/videos";
import { AppUrl } from "../utils/appUrl";

// 🔹 Repository
export class VideoRepo {
  // Get all videos (with optional pagination)
  static async getAllVideos(params: {
    ownerUserId: string;
    page?: number;
    pageSize?: number;
  }) {
    const { ownerUserId, page, pageSize } = params;

    // Build query string if pagination values exist
    const queryParts: string[] = [];
    if (page !== undefined) queryParts.push(`page=${page}`);
    if (pageSize !== undefined) queryParts.push(`pageSize=${pageSize}`);
    const query = queryParts.length ? `?${queryParts.join("&")}` : "";

    const url = `${AppUrl.getAllVideos}/${ownerUserId}${query}`;
    return ApiService.getApiResponse(url, HttpMethods.GET);
  }

  // get all videos list
  static async getAllVideosList(ownerUserId: string) {
    const url = `${AppUrl.getAllVideos}/all/${ownerUserId}`;
    return ApiService.getApiResponse(url, HttpMethods.GET);
  }

  // Create a new video
  static async createVideo(payload: CreateVideoPayload) {
    return ApiService.getApiResponse(
      AppUrl.createVideo,
      HttpMethods.POST,
      payload
    );
  }

  // Delete a video
  static async deleteVideo(videoId: string) {
    return ApiService.getApiResponse(
      AppUrl.deleteVideo(videoId),
      HttpMethods.DELETE
    );
  }
}
