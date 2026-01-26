export interface CalendarEvent {
  _id: string;
  title: string;
  date: string; // ISO date string
  description?: string;
  userId: string;
  dailyNotification: boolean;
  image?: string; // Add image support
  createdByDetails: {
    name: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CalendarDay {
  date: string;
  hasEvent: boolean;
  events: CalendarEvent[];
}
