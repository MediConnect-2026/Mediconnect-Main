import { useState, useEffect } from "react";
import { getCitaById } from "@/services/api/appointments.service";
import i18n from "@/i18n/config";
import ubicacionesService from "@/features/onboarding/services/ubicaciones.services";
import { type CitaDetalle } from "@/types/AppointmentTypes";
import { mapCitaEstadoToAppointmentStatus } from "@/utils/appointmentMapper";

export function useCitaDetails(appointmentId: string | undefined) {
    const [appointment, setAppointment] = useState<CitaDetalle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rawStatus, setRawStatus] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchCita = async () => {
            if (!appointmentId) {
                setAppointment(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const params = {
                    translate_fields: "modalidad,nombre,descripcion,motivoCancelacion,motivoConsulta,comentario",
                    target: i18n.language === "es" ? "es" : "en",
                    source: i18n.language === "es" ? "en" : "es",
                };
                const response = await getCitaById(appointmentId, params);
                const payload = response?.data;

                if (!isMounted) return;

                if (!payload) {
                    setAppointment(null);
                    setRawStatus(null);
                    return;
                }

                const appointmentData: CitaDetalle | null = Array.isArray(payload) ? (payload[0] ?? null) : payload;

                if (appointmentData) {
                    // Fetch location data if ID is present
                    const ubicacionId = appointmentData.servicio?.id_ubicacion ?? null;
                    if (ubicacionId) {
                        try {
                            const location = await ubicacionesService.getLocationById(Number(ubicacionId));
                            const coords = location?.puntoGeografico?.coordinates;

                            if (Array.isArray(coords) && coords.length >= 2) {
                                (appointmentData.servicio as any).latitude = coords[1];
                                (appointmentData.servicio as any).longitude = coords[0];
                                (appointmentData.servicio as any).ubicacionData = location;
                            }
                        } catch (err) {
                            console.warn("Could not fetch location bounds", err);
                        }
                    }

                    setAppointment(appointmentData);
                    setRawStatus(mapCitaEstadoToAppointmentStatus(appointmentData.estado));
                } else {
                    setAppointment(null);
                    setRawStatus(null);
                }
            } catch (err) {
                if (isMounted) setError("Error al cargar la cita");
                console.error("useCitaDetails error:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchCita();

        return () => {
            isMounted = false;
        };
    }, [appointmentId, i18n.language]);

    return { appointment, loading, error, rawStatus };
}
