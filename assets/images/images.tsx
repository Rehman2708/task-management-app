import { isDarkMode } from "../../src/tools";

const noNotificationDark = require("./noNotificationDark.png");
const noNotificationLight = require("./noNotificationLight.png");

export const noDataDark = require("./noDataDark.png");
const noDataLight = require("./noDataLight.png");

const noTaskDark = require("./noTaskDark.png");
const noTaskLight = require("./noTaskLight.png");

export const errorDark = require("./errorDark.png");
const errorLight = require("./errorLight.png");

export const Images = {
  noNotification: isDarkMode ? noNotificationDark : noNotificationLight,
  noData: isDarkMode ? noDataDark : noDataLight,
  noTask: isDarkMode ? noTaskDark : noTaskLight,
  error: isDarkMode ? errorDark : errorLight,
};
