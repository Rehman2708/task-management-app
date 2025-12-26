import { ApiService } from "../data/network/apiservices";
import { HttpMethods } from "../data/network/httpMethods";
import { AppUrl } from "../utils/appUrl";

export class AuthRepo {
  /**
   * 🔹 Login
   */
  static async login({
    identifier,
    password,
    notificationToken,
  }: {
    identifier: string; // email or userId
    password: string;
    notificationToken?: string | null;
  }) {
    const response = await ApiService.getApiResponse(
      AppUrl.loginEndPoint,
      HttpMethods.POST,
      { identifier, password, notificationToken }
    );
    return response;
  }

  /**
   * 🔹 Send OTP for Registration
   */
  static async sendOTP({
    name,
    email,
    password,
    partnerUserId,
  }: {
    name: string;
    email: string;
    password: string;
    partnerUserId?: string;
  }) {
    const response = await ApiService.getApiResponse(
      AppUrl.sendOTPEndPoint,
      HttpMethods.POST,
      { name, email, password, partnerUserId }
    );
    return response;
  }

  /**
   * 🔹 Verify OTP and Register
   */
  static async verifyOTP({
    email,
    otp,
    notificationToken,
  }: {
    email: string;
    otp: string;
    notificationToken?: string | null;
  }) {
    const response = await ApiService.getApiResponse(
      AppUrl.verifyOTPEndPoint,
      HttpMethods.POST,
      { email, otp, notificationToken }
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

  /**
   * 🔹 Update Password
   */
  static async updatePassword(payload: {
    userId: string;
    oldPassword: string;
    newPassword: string;
  }) {
    const data = Object.fromEntries(
      Object.entries(payload).filter(([_, v]) => v !== undefined)
    );

    return ApiService.getApiResponse(
      AppUrl.updatePasswordEndPoint,
      HttpMethods.PUT,
      data
    );
  }

  /**
   * 🔹 Add Email to Existing User
   */
  static async addEmail(payload: { userId: string; email: string }) {
    return ApiService.getApiResponse(
      AppUrl.addEmailEndPoint,
      HttpMethods.PUT,
      payload
    );
  }
}
