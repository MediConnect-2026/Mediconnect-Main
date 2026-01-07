import { type StateCreator } from "zustand";
import { type LoginSchemaType } from "@/types/AuthTypes";
import { type ForgotPasswordSchemaType } from "@/types/AuthTypes";
import { type ResetPasswordSchemaType } from "@/types/AuthTypes";

export interface AuthFlowSlice {
  loginCredentials: LoginSchemaType;
  forgotPassword: ForgotPasswordSchemaType;
  registerEmail: ForgotPasswordSchemaType;
  otp: string;
  resetPassword: ResetPasswordSchemaType;

  setLoginCredentials: (data: LoginSchemaType) => void;
  setForgotPassword: (data: ForgotPasswordSchemaType) => void;
  setRegisterEmail: (data: ForgotPasswordSchemaType) => void;
  setOtp: (otp: string) => void;
  setResetPassword: (data: ResetPasswordSchemaType) => void;
  clearAuthFlow: () => void;
}

export const createAuthFlowSlice: StateCreator<AuthFlowSlice> = (set) => ({
  loginCredentials: {
    email: "",
    password: "",
  },
  forgotPassword: {
    email: "",
  },
  registerEmail: {
    email: "",
  },
  otp: "",
  resetPassword: {
    password: "",
    confirmPassword: "",
  },

  setLoginCredentials: (data) => set({ loginCredentials: data }),

  setForgotPassword: (data) => set({ forgotPassword: data }),

  setRegisterEmail: (data) => set({ registerEmail: data }),

  setOtp: (otp) => set({ otp }),

  setResetPassword: (data) => set({ resetPassword: data }),

  clearAuthFlow: () =>
    set({
      loginCredentials: { email: "", password: "" },
      forgotPassword: { email: "" },
      otp: "",
      resetPassword: { password: "", confirmPassword: "" },
    }),
});
