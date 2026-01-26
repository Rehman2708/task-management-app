import { useState, useEffect, useCallback } from "react";
import { View, Text, Modal, ScrollView, Pressable, Switch } from "react-native";
import { useTheme } from "../infrastructure/theme";
import { useCommonStyles } from "../styles/commonstyles";
import CustomInput from "./customInput";
import CustomButton from "./customButton";
import { CalendarEvent } from "../types/calendar";
import { Ionicons } from "@expo/vector-icons";
import { Column, Row, Spacer } from "../tools";
import { useHelper } from "../utils/helper";
import { CalendarRepo } from "../repositories/calendar";
import ToastService from "../utils/toastService";
import { getNotificationPermission } from "../../notification";
import ImageModal from "./imageModal";
import AlertModal from "./AlertModal";
import ScreenWrapper from "./ScreenWrapper";

interface EventModalProps {
  visible: boolean;
  onClose: () => void;
  onEventSaved: (event: CalendarEvent) => void;
  editingEvent?: CalendarEvent | null;
  selectedDate?: string | null;
}

export default function EventModal({
  visible,
  onClose,
  onEventSaved,
  editingEvent,
  selectedDate,
}: EventModalProps) {
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const { formatDate, themeColor } = useHelper();

  // Form state
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventNotification, setEventNotification] = useState(false);
  const [eventImage, setEventImage] = useState("");
  const [eventDate, setEventDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Alert modal states
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const isEditing = !!editingEvent;

  // Helper function to get local date string
  const getLocalDateString = useCallback((date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  useEffect(() => {
    if (visible) {
      if (editingEvent) {
        setEventTitle(editingEvent.title);
        setEventDescription(editingEvent.description || "");
        setEventNotification(editingEvent.dailyNotification);
        setEventImage(editingEvent.image || "");
        setEventDate(getLocalDateString(editingEvent.date));
      } else {
        setEventTitle("");
        setEventDescription("");
        setEventNotification(false);
        setEventImage("");
        setEventDate(selectedDate || null);
      }
    }
  }, [visible, editingEvent, selectedDate, getLocalDateString]);

  const resetForm = useCallback(() => {
    setEventTitle("");
    setEventDescription("");
    setEventNotification(false);
    setEventImage("");
    setEventDate(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handlePermissionContinue = useCallback(() => {
    setEventNotification(false);
    setShowPermissionAlert(false);
  }, []);

  // Save event (create or update)
  const saveEvent = useCallback(async () => {
    if (!eventDate || !eventTitle.trim()) {
      setAlertTitle("Error");
      setAlertMessage(
        isEditing
          ? "Please enter an event title"
          : "Please select a date and enter an event title",
      );
      setShowErrorAlert(true);
      return;
    }

    if (eventNotification) {
      const hasPermission = await getNotificationPermission();
      if (!hasPermission) {
        setAlertTitle("Permission Required");
        setAlertMessage(
          "Please enable notifications in your device settings to receive daily reminders.",
        );
        setShowPermissionAlert(true);
        return;
      }
    }

    try {
      setLoading(true);

      const eventData = {
        title: eventTitle.trim(),
        description: eventDescription.trim() || undefined,
        date: eventDate,
        dailyNotification: eventNotification,
        image: eventImage || undefined,
      };

      let savedEvent: CalendarEvent;

      if (isEditing && editingEvent) {
        savedEvent = await CalendarRepo.updateEvent(
          editingEvent._id,
          eventData,
        );
        ToastService.success({
          title: "Success",
          message: "Event updated successfully",
        });
      } else {
        savedEvent = await CalendarRepo.createEvent(eventData);
        ToastService.success({
          title: "Success",
          message: eventNotification
            ? "Event created with daily notifications enabled"
            : "Event created successfully",
        });
      }

      onEventSaved(savedEvent);
      handleClose();
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} event:`,
        error,
      );
      ToastService.error({
        title: "Error",
        message: `Failed to ${isEditing ? "update" : "create"} event`,
      });
    } finally {
      setLoading(false);
    }
  }, [
    eventDate,
    eventTitle,
    eventDescription,
    eventNotification,
    eventImage,
    isEditing,
    editingEvent,
    onEventSaved,
    handleClose,
  ]);

  return (
    <>
      <Modal visible={visible} animationType="slide">
        <ScreenWrapper noHeader>
          <View style={styles.modalHeader}>
            <Text
              style={[commonStyles.titleText, { color: theme.colors.text }]}
            >
              {isEditing ? "Edit Event" : "Add Event"} (
              {eventDate ? formatDate(eventDate, "date") : "No date selected"})
            </Text>
            <Pressable onPress={handleClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <ImageModal
              key={editingEvent ? `edit-${editingEvent._id}` : "create"}
              defaultImage={eventImage}
              onChange={setEventImage}
            />

            <CustomInput
              title="Title"
              placeholder="Event title"
              value={eventTitle}
              onChangeText={setEventTitle}
            />

            <CustomInput
              title="Description"
              placeholder="Description (optional)"
              value={eventDescription}
              onChangeText={setEventDescription}
              multiline
              numberOfLines={3}
            />

            <Row alignItems="center" justifyContent="space-between">
              <Column>
                <Text
                  style={[commonStyles.basicText, { color: theme.colors.text }]}
                >
                  📱 Daily Notifications
                </Text>
                <Text
                  style={[
                    commonStyles.tinyText,
                    { color: theme.colors.textLight, marginTop: 2 },
                  ]}
                >
                  Get reminded daily at 11 AM about days left
                </Text>
              </Column>
              <Switch
                value={eventNotification}
                onValueChange={setEventNotification}
                trackColor={{
                  true: themeColor?.light || theme.colors.primary,
                  false: theme.colors.border,
                }}
                thumbColor={themeColor?.dark || theme.colors.primary}
              />
            </Row>
            <Spacer size={16} />
            <Row justifyContent="space-between">
              <CustomButton
                title="Cancel"
                onPress={handleClose}
                customStyle={{ backgroundColor: theme.colors.textLight }}
                disabled={loading}
                halfWidth
              />
              <CustomButton
                title={isEditing ? "Update Event" : "Add Event"}
                onPress={saveEvent}
                loading={loading}
                halfWidth
              />
            </Row>
          </ScrollView>
        </ScreenWrapper>
      </Modal>

      <AlertModal
        isVisible={showErrorAlert}
        title={alertTitle}
        subTitle={alertMessage}
        loading={false}
        onClose={() => setShowErrorAlert(false)}
      />

      <AlertModal
        isVisible={showPermissionAlert}
        title={alertTitle}
        subTitle={alertMessage}
        loading={false}
        onClose={() => setShowPermissionAlert(false)}
        onConfirm={handlePermissionContinue}
      />
    </>
  );
}

const styles = {
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  modalContent: {
    flex: 1,
  },
};
