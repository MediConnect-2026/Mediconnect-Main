import type { StateCreator } from "zustand";
import { type VerifyAccount } from "@/types/AccountTypes";

export interface AccountSlice {
  verifyAccountPassword: VerifyAccount | null;
  setVerifyAccountPassword: (data: VerifyAccount) => void;
  clearVerifyAccountPassword: () => void;
}

export const createAccountSlice: StateCreator<AccountSlice> = (set) => ({
  verifyAccountPassword: null,
  setVerifyAccountPassword: (data) => set({ verifyAccountPassword: data }),
  clearVerifyAccountPassword: () => set({ verifyAccountPassword: null }),
});
