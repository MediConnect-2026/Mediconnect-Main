import { type StateCreator } from "zustand";

export type UserRole = "PATIENT" | "DOCTOR" | "CENTER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  banner?: string;
}

export interface AuthSlice {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;

  login: (token: string, user: User) => void;
  logout: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  isAuthenticated: false,
  token: null,
  user: {
    id: "",
    name: "",
    email: "",
    role: "CENTER",
  },
  //PATIENT
  //DOCTOR

  //CENTER

  login: (token, user) =>
    set({
      token,
      user,
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    }),
});
