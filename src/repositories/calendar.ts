import { ApiService } from "../data/network/apiservices";
import { HttpMethods } from "../data/network/httpMethods";
import { AppUrl } from "../utils/appUrl";
import { CalendarEvent } from "../types/calendar";
import { useAuthStore } from "../store/authStore";

export class CalendarRepo {
  static async getEvents(): Promise<CalendarEvent[]> {
    try {
      const { user } = useAuthStore.getState();
      if (!user?.userId) {
        throw new Error("User not authenticated");
      }

      const url = AppUrl.getCalendarEvents(user.userId);

      const response = await ApiService.getApiResponse(url, HttpMethods.GET);

      return response?.data || [];
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      throw error;
    }
  }

  static async createEvent(eventData: {
    title: string;
    description?: string;
    date: string;
    dailyNotification?: boolean;
    image?: string;
  }): Promise<CalendarEvent> {
    try {
      const { user } = useAuthStore.getState();
      if (!user?.userId) {
        throw new Error("User not authenticated");
      }

      const response = await ApiService.getApiResponse(
        AppUrl.createCalendarEvent(user.userId),
        HttpMethods.POST,
        eventData,
      );

      return response?.data;
    } catch (error) {
      console.error("Error creating calendar event:", error);
      throw error;
    }
  }

  static async updateEvent(
    eventId: string,
    eventData: {
      title: string;
      description?: string;
      date: string;
      dailyNotification?: boolean;
      image?: string;
    },
  ): Promise<CalendarEvent> {
    try {
      const { user } = useAuthStore.getState();
      if (!user?.userId) {
        throw new Error("User not authenticated");
      }

      const response = await ApiService.getApiResponse(
        AppUrl.updateCalendarEvent(user.userId, eventId),
        HttpMethods.PUT,
        eventData,
      );

      return response?.data;
    } catch (error) {
      console.error("Error updating calendar event:", error);
      throw error;
    }
  }

  static async deleteEvent(eventId: string): Promise<void> {
    try {
      const { user } = useAuthStore.getState();
      if (!user?.userId) {
        throw new Error("User not authenticated");
      }

      await ApiService.getApiResponse(
        AppUrl.deleteCalendarEvent(user.userId, eventId),
        HttpMethods.DELETE,
      );
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      throw error;
    }
  }

  static async getEventsByRange(
    startDate: string,
    endDate: string,
  ): Promise<CalendarEvent[]> {
    try {
      const { user } = useAuthStore.getState();
      if (!user?.userId) {
        throw new Error("User not authenticated");
      }

      const response = await ApiService.getApiResponse(
        `${AppUrl.getCalendarEventsByRange(user.userId)}?startDate=${startDate}&endDate=${endDate}`,
        HttpMethods.GET,
      );

      return response?.data || [];
    } catch (error) {
      console.error("Error fetching calendar events by range:", error);
      throw error;
    }
  }
}
