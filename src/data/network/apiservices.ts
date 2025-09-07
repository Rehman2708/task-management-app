import { AppExceptions } from "../appExceptions";
import { HttpMethods } from "./httpMethods";

interface ErrorObject {
  message: string;
}

type HttpMethod =
  | HttpMethods.GET
  | HttpMethods.POST
  | HttpMethods.PUT
  | HttpMethods.DELETE
  | HttpMethods.PATCH;

interface RequestBody {
  method: HttpMethod;
  headers: Record<string, string>;
  body?: string;
}

export class ApiService {
  static async getApiResponse(url: string, method: HttpMethod, payload?: any) {
    try {
      const requestBody = await this.createRequestBody(method, payload);
      const response = await fetch(url, requestBody);
      return await this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private static async createRequestBody(
    method: HttpMethod,
    payload?: any
  ): Promise<RequestBody> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    return method === HttpMethods.GET
      ? { method, headers }
      : { method, headers, body: JSON.stringify(payload) };
  }

  private static async handleResponse(response: Response) {
    let body: any = null;

    try {
      body = await response.json();
    } catch (err) {
      throw new AppExceptions(
        "Invalid JSON in response",
        this.getErrorMessage(response.status)
      );
    }

    if (response.ok) {
      return body;
    }
    console.log(body);
    // Handle your backend error structure
    const message =
      typeof body.message === "string"
        ? body.message
        : body.error?.message || "Unknown error from server";

    throw new AppExceptions(message, this.getErrorMessage(response.status));
  }

  private static getErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return "Bad Request";
      case 404:
        return "Not Found";
      case 422:
        return "Validation Error";
      case 500:
        return "Internal Server Error";
      default:
        return "An unknown error occurred";
    }
  }

  private static handleError(error: unknown): Error {
    if (error instanceof AppExceptions) {
      return error;
    }
    return new Error("An unexpected error occurred");
  }
}
