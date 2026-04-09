import { type StateCreator } from "zustand";
import type { LlamadaEntranteEvent } from "@/types/WebSocketTypes";

export interface NotificationsSlice {
  unreadNotificationsCount: number;
  setUnreadNotificationsCount: (count: number) => void;
  incrementUnreadNotificationsCount: (amount?: number) => void;
  
  incomingCall: LlamadaEntranteEvent | null;
  setIncomingCall: (call: LlamadaEntranteEvent | null) => void;
}

export const createNotificationsSlice: StateCreator<NotificationsSlice> = (set, get) => ({
  unreadNotificationsCount: 0,
  setUnreadNotificationsCount: (count) =>
    set({
      unreadNotificationsCount: count,
    }),
  incrementUnreadNotificationsCount: (amount = 1) =>
    set({
      unreadNotificationsCount: get().unreadNotificationsCount + amount,
    }),

  incomingCall: null,
  setIncomingCall: (call) =>
    set({
      incomingCall: call,
    }),
});