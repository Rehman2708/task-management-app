import { ApiService } from "../data/network/apiservices";
import { HttpMethods } from "../data/network/httpMethods";
import { AppUrl } from "../utils/appUrl";

export class AuthRepo {
  /**
   * 🔹 Login
   */
  static async login({
    userId,
    password,
    notificationToken,
  }: {
    userId: string;
    password: string;
    notificationToken?: string | null;
  }) {
    const response = await ApiService.getApiResponse(
      AppUrl.loginEndPoint,
      HttpMethods.POST,
      { userId, password, notificationToken }
    );
    return response;
  }

  /**
   * 🔹 Register
   */
  static async register({
    name,
    userId,
    password,
    partnerUserId,
    notificationToken,
  }: {
    name: string;
    userId: string;
    password: string;
    partnerUserId?: string;
    notificationToken?: string | null;
  }) {
    const response = await ApiService.getApiResponse(
      AppUrl.registerEndPoint,
      HttpMethods.POST,
      { name, userId, password, partnerUserId, notificationToken }
    );
    return response;
  }

  /**
   * 🔹 Connect Partner
   */
  static async connectPartner({
    userId,
    partnerUserId,
  }: {
    userId: string;
    partnerUserId: string;
  }) {
    const response = await ApiService.getApiResponse(
      AppUrl.connectPartnerEndPoint,
      HttpMethods.POST,
      { userId, partnerUserId }
    );
    return response;
  }

  /**
   * 🔹 Get User Details
   */
  static async getUserDetails(userId: string) {
    return ApiService.getApiResponse(
      AppUrl.getUserEndPoint(userId),
      HttpMethods.GET
    );
  }

  /**
   * 🔹 Logout (Clear Notification Token)
   */
  static async logout(userId: string) {
    return ApiService.getApiResponse(AppUrl.logoutEndPoint, HttpMethods.POST, {
      userId,
    });
  }

  /**
   * 🔹 Update Profile (Name & Image)
   */
  static async updateProfile(payload: {
    userId: string;
    name?: string;
    about?: string;
    image?: string | null;
  }) {
    const data = Object.fromEntries(
      Object.entries(payload).filter(([_, v]) => v !== undefined)
    );
    return ApiService.getApiResponse(
      AppUrl.updateProfileEndPoint,
      HttpMethods.PUT,
      data
    );
  }

  /**
   * 🔹 Update Theme (Light & Dark)
   */
  static async updateTheme(payload: {
    userId: string;
    theme: {
      light?: string;
      dark?: string;
    };
  }) {
    const data = Object.fromEntries(
      Object.entries(payload).filter(([_, v]) => v !== undefined)
    );

    return ApiService.getApiResponse(
      AppUrl.updateThemeEndPoint,
      HttpMethods.PUT,
      data
    );
  }

  /**
   * 🔹 Update Theme (Light & Dark)
   */
  static async updateFont(payload: { userId: string; font: string }) {
    const data = Object.fromEntries(
      Object.entries(payload).filter(([_, v]) => v !== undefined)
    );

    return ApiService.getApiResponse(
      AppUrl.updateFontEndPoint,
      HttpMethods.PUT,
      data
    );
  }
}
