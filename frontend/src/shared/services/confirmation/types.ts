// types.ts
import React from "react";

export type ConfirmVariant = "default" | "destructive" | "warning" | "success";
export type ConfirmIconSize = "sm" | "md" | "lg";
export interface DontAskAgainOptions {
  id: string; // (Ex: "delete-user-warning", "logout-confirm")
  label?: string;
}

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  size?: string;
  icon?: React.ReactNode;
  iconSize?: ConfirmIconSize;
  dontAskAgain?: DontAskAgainOptions;
}

export interface ConfirmContextType {
  confirm: (params: string | ConfirmOptions) => Promise<boolean>;
}