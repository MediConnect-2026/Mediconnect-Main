import { create } from 'zustand';

interface TeleconsultState {
    /** Daily.co room URL for the current active teleconsult */
    callUrl: string | null;
    /** The appointment ID that the current session belongs to */
    activeAppointmentId: string | null;
    setCallSession: (appointmentId: string, url: string) => void;
    clearCallSession: () => void;
}

export const useTeleconsultStore = create<TeleconsultState>((set) => ({
    callUrl: null,
    activeAppointmentId: null,
    setCallSession: (appointmentId, url) =>
        set({ activeAppointmentId: appointmentId, callUrl: url }),
    clearCallSession: () =>
        set({ activeAppointmentId: null, callUrl: null }),
}));
