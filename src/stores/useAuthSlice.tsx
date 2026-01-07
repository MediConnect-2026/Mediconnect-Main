import { type StateCreator } from "zustand";
import { type LoginSchemaType } from "@/schema/AuthSchema";
import { type ForgotPasswordSchemaType } from "@/schema/AuthSchema";
import { type ResetPasswordSchemaType } from "@/schema/AuthSchema";

export interface AuthSlice {
  loginCredentials: LoginSchemaType;
  forgotPassword: ForgotPasswordSchemaType;
  otp: string;
  resetPassword: ResetPasswordSchemaType;
  isAuthenticated: boolean;
  token: string | null;
  selectedRole: string | null;

  setLoginCredentials: (data: LoginSchemaType) => void;
  setForgotPassword: (data: ForgotPasswordSchemaType) => void;
  setOtp: (otp: string) => void;
  setResetPassword: (data: ResetPasswordSchemaType) => void;
  clearForgotPassword: () => void;
  login: (token: string) => void;
  setSelectedRole: (role: string | null) => void;
  logout: () => void;
  reset: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  loginCredentials: {
    email: "",
    password: "",
  },
  forgotPassword: {
    email: "",
  },
  otp: "",
  resetPassword: {
    password: "",
    confirmPassword: "",
  },
  isAuthenticated: false,
  token: null,
  selectedRole: null,

  setLoginCredentials: (data) => set({ loginCredentials: data }),
  setForgotPassword: (data) => set({ forgotPassword: data }),
  setOtp: (otp) => set({ otp }),
  setResetPassword: (data) => set({ resetPassword: data }),
  clearForgotPassword: () =>
    set({
      forgotPassword: { email: "" },
      otp: "",
      resetPassword: { password: "", confirmPassword: "" },
    }),
  login: (token) =>
    set({
      token,
      isAuthenticated: true,
    }),

  setSelectedRole: (role) => set({ selectedRole: role }),
  logout: () =>
    set({
      token: null,
      isAuthenticated: false,
      loginCredentials: { email: "", password: "" },
      forgotPassword: { email: "" },
      otp: "",
      resetPassword: { password: "", confirmPassword: "" },
    }),
  reset: () =>
    set({
      forgotPassword: { email: "" },
      otp: "",
      resetPassword: { password: "", confirmPassword: "" },
      selectedRole: null,
    }),
});
