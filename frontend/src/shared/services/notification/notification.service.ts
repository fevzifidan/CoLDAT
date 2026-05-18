// src/shared/services/notification.service.ts
import { toast, type ExternalToast } from "sonner";

/**
 * Default configurations for Sonner
 */
const defaultOptions: ExternalToast = {
  duration: 4000,
  closeButton: true,
};

/**
 * Central Notification Service
 */
export const notificationService = {
  /**
   * Success Notification
   */
  success: (message: string, options?: ExternalToast) => {
    toast.success(message, {
      ...defaultOptions,
      ...options,
    });
  },

  /**
   * Error Notification
   */
  error: (message: string, options?: ExternalToast) => {
    toast.error(message, {
      ...defaultOptions,
      duration: 5000, // We want error notifications to stay longer in the screen
      ...options,
    });
  },

  /**
   * Information Notification
   */
  info: (message: string, options?: ExternalToast) => {
    toast.info(message, {
      ...defaultOptions,
      ...options,
    });
  },

  /**
   * Warning Notification
   */
  warning: (message: string, options?: ExternalToast) => {
    toast.warning(message, {
      ...defaultOptions,
      ...options,
    });
  },

  /**
   * Promise-based Notification (Loading -> Success/Error)
   * @param promise - Asynchronous process to be followed
   * @param messages - Loading, success, and error messages
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      ...defaultOptions,
    });
  },

  /**
   * Manually turning off a toast or all of them
   */
  dismiss: (id?: string | number) => {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  },
};

export default notificationService;