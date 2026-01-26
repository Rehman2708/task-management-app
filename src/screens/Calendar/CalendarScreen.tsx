import { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { useTheme } from "../../infrastructure/theme";
import { useCommonStyles } from "../../styles/commonstyles";
import ScreenWrapper from "../../components/ScreenWrapper";
import CustomButton from "../../components/customButton";
import { CalendarEvent } from "../../types/calendar";
import { Ionicons } from "@expo/vector-icons";
import { Row } from "../../tools";
import { useHelper } from "../../utils/helper";
import { CalendarRepo } from "../../repositories/calendar";
import ToastService from "../../utils/toastService";
import ScreenLoader, { LoaderTypes } from "../../components/screenLoader";
import AlertModal from "../../components/AlertModal";
import EventCard from "../../components/eventCard";
import EventModal from "../../components/EventModal";

export default function CalendarScreen() {
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const { formatDate, themeColor } = useHelper();

  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Alert modal states
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  // Memoized constants
  const monthNames = useMemo(
    () => [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    [],
  );

  const dayNames = useMemo(
    () => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    [],
  );

  // Load events on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Helper functions (memoized for performance)
  const getLocalDateString = useCallback((date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const createLocalDate = useCallback((dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }, []);

  const getRemainingDays = useCallback(
    (eventDate: string) => {
      const today = new Date();
      const todayString = getLocalDateString(today);
      const eventDateString = getLocalDateString(eventDate);

      const todayLocal = createLocalDate(todayString);
      const eventLocal = createLocalDate(eventDateString);

      const diffTime = eventLocal.getTime() - todayLocal.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    },
    [getLocalDateString, createLocalDate],
  );

  // Optimized load events function
  const loadEvents = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const eventsData = await CalendarRepo.getEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error("Error loading events:", error);
      ToastService.error({
        title: "Error",
        message: "Failed to load calendar events",
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [refreshing]);

  // Optimized refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, [loadEvents]);

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    setEditingEvent(event);
    setShowEventModal(true);
  }, []);

  const handleAddEvent = useCallback(() => {
    setEditingEvent(null);
    setShowEventModal(true);
  }, []);

  const handleEventSaved = useCallback(
    (savedEvent: CalendarEvent) => {
      if (editingEvent) {
        setEvents((prev) =>
          prev.map((event) =>
            event._id === editingEvent._id ? savedEvent : event,
          ),
        );
      } else {
        setEvents((prev) => [...prev, savedEvent]);
      }
      setSelectedDate(null);
    },
    [editingEvent],
  );

  const handleDeleteEvent = useCallback((eventId: string) => {
    setEventToDelete(eventId);
    setShowDeleteAlert(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!eventToDelete) return;

    try {
      setLoading(true);
      await CalendarRepo.deleteEvent(eventToDelete);
      setEvents((prev) => prev.filter((event) => event._id !== eventToDelete));

      ToastService.success({
        title: "Success",
        message: "Event deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      ToastService.error({
        title: "Error",
        message: "Failed to delete event",
      });
    } finally {
      setLoading(false);
      setShowDeleteAlert(false);
      setEventToDelete(null);
    }
  }, [eventToDelete]);

  // Memoized calendar calculations
  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const daysArray = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      daysArray.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(new Date(year, month, day));
    }

    return daysArray;
  }, [currentDate]);

  // Optimized navigation function
  const navigateMonth = useCallback((direction: "prev" | "next") => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (direction === "prev") {
        newDate.setMonth(prevDate.getMonth() - 1);
      } else {
        newDate.setMonth(prevDate.getMonth() + 1);
      }
      return newDate;
    });
  }, []);

  const getEventsForDate = useCallback(
    (date: Date) => {
      const dateString = getLocalDateString(date);
      return events.filter((event) => {
        const eventDate = getLocalDateString(event.date);
        return eventDate === dateString;
      });
    },
    [events, getLocalDateString],
  );

  // Memoized sorted events
  const sortedEvents = useMemo(() => {
    return events.sort((a, b) => {
      const today = new Date();
      const todayString = getLocalDateString(today);
      const todayLocal = createLocalDate(todayString);

      const aDate = createLocalDate(getLocalDateString(a.date));
      const bDate = createLocalDate(getLocalDateString(b.date));

      const aDaysFromToday = Math.ceil(
        (aDate.getTime() - todayLocal.getTime()) / (1000 * 60 * 60 * 24),
      );
      const bDaysFromToday = Math.ceil(
        (bDate.getTime() - todayLocal.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Separate upcoming/today events from past events
      const aIsUpcoming = aDaysFromToday >= 0;
      const bIsUpcoming = bDaysFromToday >= 0;

      if (aIsUpcoming && !bIsUpcoming) return -1; // a is upcoming, b is past
      if (!aIsUpcoming && bIsUpcoming) return 1; // a is past, b is upcoming

      // Both are upcoming or both are past - sort by date
      return aDate.getTime() - bDate.getTime();
    });
  }, [events, getLocalDateString, createLocalDate]);

  if (initialLoading) {
    return <ScreenLoader type={LoaderTypes.ProfileScreen} />;
  }

  return (
    <ScreenWrapper title="Calendar" showBackbutton>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColor?.dark || theme.colors.primary]}
          />
        }
      >
        <Row
          justifyContent="space-between"
          alignItems="center"
          style={[
            styles.calendarHeader,
            { backgroundColor: theme.colors.loaderBg },
          ]}
        >
          <Pressable
            onPress={() => navigateMonth("prev")}
            style={styles.navButton}
          >
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </Pressable>

          <Text style={[commonStyles.titleText, { color: theme.colors.text }]}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>

          <Pressable
            onPress={() => navigateMonth("next")}
            style={styles.navButton}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme.colors.text}
            />
          </Pressable>
        </Row>

        <Row style={styles.dayNamesRow}>
          {dayNames.map((dayName) => (
            <View key={dayName} style={styles.dayNameCell}>
              <Text
                style={[
                  commonStyles.basicText,
                  { color: theme.colors.textLight },
                ]}
              >
                {dayName}
              </Text>
            </View>
          ))}
        </Row>

        <View style={styles.calendarGrid}>
          {days.map((day, index) => {
            if (!day) {
              return <View key={index} style={styles.dayCell} />;
            }

            const dateString = getLocalDateString(day);
            const dayEvents = getEventsForDate(day);
            const isSelected = selectedDate === dateString;
            const isToday = new Date().toDateString() === day.toDateString();

            return (
              <Pressable
                key={index}
                style={[
                  styles.dayCell,
                  { backgroundColor: theme.colors.loaderBg },
                  isSelected && {
                    backgroundColor: themeColor?.dark || theme.colors.primary,
                  },
                  isToday &&
                    !isSelected && {
                      borderColor: themeColor?.dark || theme.colors.primary,
                      borderWidth: 2,
                    },
                ]}
                onPress={() => setSelectedDate(dateString)}
              >
                <Text
                  style={[
                    commonStyles.basicText,
                    {
                      color: isSelected
                        ? theme.colors.background
                        : theme.colors.text,
                    },
                    isToday &&
                      !isSelected && {
                        color: themeColor?.dark || theme.colors.primary,
                      },
                  ]}
                >
                  {day.getDate()}
                </Text>
                {dayEvents.length > 0 && (
                  <View
                    style={[
                      styles.eventDot,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.background
                          : themeColor?.dark || theme.colors.primary,
                      },
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        {selectedDate && (
          <CustomButton
            title="Add Event"
            onPress={handleAddEvent}
            loading={loading}
          />
        )}

        <View style={styles.eventsSection}>
          <Text
            style={[
              commonStyles.titleText,
              { color: theme.colors.text, marginBottom: 15 },
            ]}
          >
            All Events
          </Text>

          {sortedEvents.length === 0 ? (
            <Text
              style={[
                commonStyles.basicText,
                {
                  color: theme.colors.textLight,
                  textAlign: "center",
                  marginTop: 20,
                },
              ]}
            >
              No events scheduled
            </Text>
          ) : (
            sortedEvents.map((event) => {
              return (
                <EventCard
                  key={event._id}
                  item={event}
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteEvent}
                />
              );
            })
          )}
        </View>
      </ScrollView>

      <EventModal
        visible={showEventModal}
        onClose={() => setShowEventModal(false)}
        onEventSaved={handleEventSaved}
        editingEvent={editingEvent}
        selectedDate={selectedDate}
      />

      <AlertModal
        isVisible={showDeleteAlert}
        title="Delete Event"
        subTitle="Are you sure you want to delete this event?"
        loading={loading}
        error={true}
        onClose={() => {
          setShowDeleteAlert(false);
          setEventToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarHeader: {
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  navButton: {
    padding: 10,
  },
  dayNamesRow: {
    marginBottom: 10,
  },
  dayNameCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 5,
    position: "relative",
  },

  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: "absolute",
    bottom: 4,
  },
  eventsSection: {
    marginBottom: 20,
  },
});
