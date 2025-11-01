import { createNavigationContainerRef } from "@react-navigation/native";
import { ROUTES } from "../enums/routes";

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    console.log("Navigation not ready yet");
  }
}

export const handleNotificationNavigation = (notData?: any) => {
  if (!notData) return;
  switch (notData.type) {
    case "note":
      notData.noteId
        ? navigate(ROUTES.VIEW_NOTE, { noteId: notData.noteId })
        : navigate(ROUTES.NOTES);
      break;

    case "list":
      notData.listId
        ? navigate(ROUTES.VIEW_LIST, { listId: notData.listId })
        : navigate(ROUTES.LISTS);
      break;

    case "task":
      notData.taskId
        ? navigate(ROUTES.TASK_DETAIL, {
            taskId: notData.taskId,
            readOnly: !notData.isActive,
            showComments: notData.isComment,
            commentSubtaskId: notData.commentSubtaskId,
          })
        : navigate(ROUTES.TASKS);
      break;

    case "profile":
      navigate(ROUTES.PROFILE);
      break;

    case "video":
      notData.videoData
        ? navigate(ROUTES.SINGLE_VIDEO, {
            video: notData.videoData,
            showComments: notData.isComment,
          })
        : navigate(ROUTES.REELS);
      break;

    default:
      console.log("Unhandled notification type:", notData.type);
      break;
  }
};
