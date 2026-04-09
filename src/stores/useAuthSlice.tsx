import { type StateCreator } from "zustand";
import type { User } from "@/services/auth/auth.types";

export interface AuthSlice {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;

  login: (accessToken: string, refreshToken: string, user: User) => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  user: null,

  //DOCTOR
  //PATIENT
  //DOCTOR

  //CENTER

  login: (accessToken, refreshToken, user) =>
    set({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: true,
    }),

  updateTokens: (accessToken, refreshToken) =>
    set({
      accessToken,
      refreshToken,
    }),

  updateUser: (user) =>
    set({
      user,
    }),

  logout: () => {
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });

    // Limpiar también el AuthFlowSlice si existe
    const state = get() as any;
    if (state.clearAuthFlow) {
      state.clearAuthFlow();
    }
  },
});
