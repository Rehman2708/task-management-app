import { ApiService } from "../data/network/apiservices";
import { HttpMethods } from "../data/network/httpMethods";
import { AppUrl } from "../utils/appUrl";

export interface MarkReadPayload {
  userId: string;
  notificationIds: string[];
}

export interface GetNotificationsParams {
  userId: string;
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean; // optional filter for unread notifications
}

export class NotificationRepo {
  // 🔹 Get notifications for a user (with optional pagination)
  static async getNotifications(params: GetNotificationsParams) {
    const { userId, page, pageSize, unreadOnly } = params;

    const queryParts: string[] = [];
    if (page !== undefined) queryParts.push(`page=${page}`);
    if (pageSize !== undefined) queryParts.push(`pageSize=${pageSize}`);
    if (unreadOnly) queryParts.push(`unreadOnly=true`);
    const query = queryParts.length ? `?${queryParts.join("&")}` : "";

    const url = `${AppUrl.getNotifications}/${userId}${query}`;
    return ApiService.getApiResponse(url, HttpMethods.GET);
  }

  // 🔹 Mark notifications as read
  static async markNotificationsAsRead(payload: MarkReadPayload) {
    return ApiService.getApiResponse(
      AppUrl.markNotificationsRead,
      HttpMethods.PATCH,
      payload
    );
  }
}
