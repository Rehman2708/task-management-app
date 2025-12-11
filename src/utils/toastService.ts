import Toast from "react-native-toast-message";

export interface ToastConfig {
  title: string;
  message?: string;
  duration?: number;
}

class ToastService {
  /**
   * Show success toast message
   */
  static success(config: ToastConfig) {
    Toast.show({
      type: "success",
      text1: config.title,
      text2: config.message,
      visibilityTime: config.duration || 3000,
      position: "top",
    });
  }

  /**
   * Show error toast message
   */
  static error(config: ToastConfig) {
    Toast.show({
      type: "error",
      text1: config.title,
      text2: config.message,
      visibilityTime: config.duration || 4000,
      position: "top",
    });
  }

  /**
   * Show info toast message
   */
  static info(config: ToastConfig) {
    Toast.show({
      type: "info",
      text1: config.title,
      text2: config.message,
      visibilityTime: config.duration || 3000,
      position: "top",
    });
  }

  /**
   * Show warning toast message
   */
  static warning(config: ToastConfig) {
    Toast.show({
      type: "warning",
      text1: config.title,
      text2: config.message,
      visibilityTime: config.duration || 3500,
      position: "top",
    });
  }

  /**
   * Hide current toast
   */
  static hide() {
    Toast.hide();
  }

  /**
   * Quick success message
   */
  static quickSuccess(message: string) {
    this.success({ title: message });
  }

  /**
   * Quick error message
   */
  static quickError(message: string) {
    this.error({ title: message });
  }

  /**
   * Quick info message
   */
  static quickInfo(message: string) {
    this.info({ title: message });
  }

  /**
   * Quick warning message
   */
  static quickWarning(message: string) {
    this.warning({ title: message });
  }
}

export default ToastService;
