import { type StateCreator } from "zustand";
import { type LoginSchemaType } from "@/types/AuthTypes";
import { type ForgotPasswordSchemaType } from "@/types/AuthTypes";
import { type ResetPasswordSchemaType } from "@/types/AuthTypes";

export interface AuthFlowSlice {
  loginCredentials: LoginSchemaType;
  forgotPassword: ForgotPasswordSchemaType;
  registerEmail: ForgotPasswordSchemaType;
  otp: string;
  verifyEmail: {
    verified: boolean;
    email: string;
  };
  resetPassword: ResetPasswordSchemaType;
  registrationToken: string;
  googleUserData: {
    email?: string;
    nombre?: string;
    apellido?: string;
    foto?: string;
    banner?: string;
  } | null;

  setLoginCredentials: (data: LoginSchemaType) => void;
  setForgotPassword: (data: ForgotPasswordSchemaType) => void;
  setRegisterEmail: (data: ForgotPasswordSchemaType) => void;
  setOtp: (otp: string) => void;
  setVerifyEmail: (data: { verified: boolean; email: string }) => void;
  setResetPassword: (data: ResetPasswordSchemaType) => void;
  setRegistrationToken: (token: string) => void;
  setGoogleUserData: (data: { email?: string; nombre?: string; apellido?: string; foto?: string; banner?: string; } | null) => void;
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
  verifyEmail: {
    verified: true,
    email: "",
  },
  registrationToken: "",
  googleUserData: null,

  setLoginCredentials: (data) => set({ loginCredentials: data }),

  setForgotPassword: (data) => set({ forgotPassword: data }),

  setRegisterEmail: (data) => set({ registerEmail: data }),

  setOtp: (otp) => set({ otp }),

  setVerifyEmail: (data) => set({ verifyEmail: data }),

  setResetPassword: (data) => set({ resetPassword: data }),

  setRegistrationToken: (token) => set({ registrationToken: token }),

  setGoogleUserData: (data) => set({ googleUserData: data }),

  clearAuthFlow: () =>
    set({
      loginCredentials: { email: "", password: "" },
      forgotPassword: { email: "" },
      otp: "",
      verifyEmail: { verified: false, email: "" },
      resetPassword: { password: "", confirmPassword: "" },
      registrationToken: "",
      googleUserData: null,
    }),
});
