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
  }: {
    userId: string;
    password: string;
  }) {
    const response = await ApiService.getApiResponse(
      AppUrl.loginEndPoint,
      HttpMethods.POST,
      { userId, password }
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
  }: {
    name: string;
    userId: string;
    password: string;
    partnerUserId?: string;
  }) {
    const response = await ApiService.getApiResponse(
      AppUrl.registerEndPoint,
      HttpMethods.POST,
      { name, userId, password, partnerUserId }
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
}
