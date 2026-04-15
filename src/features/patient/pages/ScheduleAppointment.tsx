import { useTranslation } from "react-i18next";
import MCBackButton from "@/shared/components/forms/MCBackButton";
import MCButton from "@/shared/components/forms/MCButton";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import {
  Calendar,
  Clock,
  PersonStanding,
  Stethoscope,
  ShieldCheck,
  MapPinCheck,
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { useAppointmentStore } from "@/stores/useAppointmentStore";
import { useEffect, useState } from "react";
import { patientService } from "@/shared/navigation/userMenu/editProfile/patient/services/patient.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MapScheduleLocation from "@/shared/components/maps/MapScheduleLocation";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import ScheduleAppointmentDialog from "../components/appoiments/ScheduleAppointmentDialog";
import { getUserFullName } from "@/services/auth/auth.types";
import { doctorService } from "@/shared/navigation/userMenu/editProfile/doctor/services";
import type { ServiceDetail } from "@/shared/navigation/userMenu/editProfile/doctor/services/doctor.types";
import { Skeleton } from "@/shared/ui/skeleton";
import i18n from "@/i18n/config";
import { useMyInsurances } from "../hooks";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/react-query/config";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatTimeTo12h } from "@/utils/appointmentMapper";

// Skeleton para la página de resumen de cita
const ScheduleAppointmentSkeleton = ({ isMobile }: { isMobile: boolean }) => {
  return (
    <div className={`${isMobile ? "w-full" : "max-w-2xl"} flex flex-col gap-4`}>
      <Skeleton className={`${isMobile ? "h-8" : "h-10"} w-3/4`} />

      <div
        className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-[4.5fr_5.5fr]"} gap-4`}
      >
        <Skeleton
          className={`w-full ${isMobile ? "h-48" : "h-60"} rounded-xl`}
        />
        <div className="space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-px w-full" />

      <div className="flex justify-between">
        <Skeleton className="h-16 w-24" />
        <Skeleton className="h-16 w-24" />
        <Skeleton className="h-16 w-24" />
      </div>

      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className={`h-${isMobile ? "14" : "12"} w-full rounded-2xl`} />
    </div>
  );
};

function ScheduleAppointment() {
  const { t } = useTranslation("patient");
  const user = useAppStore((state) => state.user);
  const appointmentDetails = useAppointmentStore((state) => state.appointment);
  const isRescheduling = useAppointmentStore((state) => state.isRescheduling);

  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const isPatient = user?.rol === "PATIENT";

  const [loading, setLoading] = useState(false);
  const [serviceData, setServiceData] = useState<ServiceDetail | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtener seguros del paciente para mostrar el nombre del seguro
  const { data: availableInsurances = [] } = useMyInsurances();

  useEffect(() => {
    if (!isPatient) {
      navigate("/search", { replace: true });
    }
  }, [isPatient, navigate]);

  // Cargar datos del servicio si existe servicioId
  useEffect(() => {
    const loadServiceData = async () => {
      // Verificar si existe servicioId en el appointment
      if (!appointmentDetails.serviceId) {
        setServiceData(null);
        return;
      }

      setLoading(true);

      try {
        const response = await doctorService.getServiceById(
          Number(appointmentDetails.serviceId),
          {
            target: i18n.language || "es",
            source: i18n.language === "es" ? "en" : "es",
            translate_fields:
              "nombre,descripcion,modalidad,especialidad.nombre",
          },
        );

        if (response.success && response.data) {
          setServiceData(response.data);
          console.log("Service data loaded:", response.data);
        } else {
          console.error("Failed to load service data");
        }
      } catch (err: any) {
        console.error("Error loading service details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadServiceData();
  }, [appointmentDetails.serviceId, t]);

  useEffect(() => {
    document.body.style.overflow = "unset";
    document.body.style.paddingRight = "0px";
    document.documentElement.style.overflow = "unset";
    window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, []);

  if (!isPatient) {
    return null;
  }

  // Datos del doctor (del servicio si existe, sino del usuario actual por defecto)
  const doctorData = serviceData?.doctor || null;
  const doctorFullName = doctorData
    ? `Dr. ${doctorData.nombre} ${doctorData.apellido}`
    : getUserFullName(user) || t("doctors.profile", "Doctor");
  const doctorAvatar = doctorData?.usuario?.fotoPerfil || user.fotoPerfil;
  const doctorSpecialty =
    serviceData?.especialidad?.nombre ||
    t("doctors.specialty", "Internal Medicine Specialist");

  // Ubicación del servicio
  const primaryLocation =
    serviceData?.ubicacion && serviceData.ubicacion.length > 0
      ? serviceData.ubicacion[0]
      : null;

  // Obtener nombre del seguro
  const selectedInsurance = availableInsurances.find(
    (insurance) =>
      insurance.id.toString() === appointmentDetails.insuranceProvider,
  );
  const insuranceName =
    appointmentDetails.useInsurance === false
      ? t("appointments.noInsurance", "Sin seguro")
      : selectedInsurance
        ? `${selectedInsurance.nombre}${selectedInsurance.tipoSeguro ? ` - ${typeof selectedInsurance.tipoSeguro === "string" ? selectedInsurance.tipoSeguro : selectedInsurance.tipoSeguro.nombre}` : ""}`
        : appointmentDetails.insuranceProvider;

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const seguroSeleccionado = availableInsurances.find(
        (insurance) =>
          insurance.id.toString() === appointmentDetails.insuranceProvider,
      );

      const modalidadFormatted =
        (appointmentDetails.selectedModality || "presencial")
          .charAt(0)
          .toUpperCase() +
        (appointmentDetails.selectedModality || "presencial").slice(1);

      const appointmentData: any = {
        servicioId: Number(appointmentDetails.serviceId),
        horarioId: appointmentDetails.horarioId || 0,
        fecha: appointmentDetails.date,
        hora: appointmentDetails.time,
        modalidad: modalidadFormatted,
        numPacientes: appointmentDetails.numberOfSessions,
        motivoConsulta: appointmentDetails.reason,
      };

      // Sólo agregar datos de seguro si el usuario indicó que usará seguro
      if (
        appointmentDetails.useInsurance !== false &&
        appointmentDetails.insuranceProvider
      ) {
        appointmentData.seguroId = Number(
          appointmentDetails.insuranceProvider || 0,
        );
        appointmentData.tipoSeguroId = seguroSeleccionado?.idTipoSeguro || 0;
      }

      let response;
      console.log(
        "Submitting appointment data:",
        appointmentData,
        "isRescheduling:",
        isRescheduling,
        "appointmentId:",
        appointmentDetails.appointmentId,
      );
      if (isRescheduling && appointmentDetails.appointmentId) {
        response = await patientService.updateAppointment(
          Number(appointmentDetails.appointmentId),
          {
            servicioId: Number(appointmentDetails.serviceId),
            horarioId: appointmentDetails.horarioId || 0,
            fecha: appointmentDetails.date,
            hora: appointmentDetails.time,
            modalidad: modalidadFormatted,
            numPacientes: appointmentDetails.numberOfSessions,
            motivoConsulta: appointmentDetails.reason,
            seguroId: appointmentData.seguroId || null,
            tipoSeguroId: appointmentData.tipoSeguroId || null,
          },
        );
      } else {
        response = await patientService.createAppointment(
          appointmentData as any,
        );
      }

      if (response && (response.success || response.id)) {
        toast.success(
          isRescheduling
            ? t(
                "appointments.rescheduleSuccess",
                "Cita reagendada exitosamente",
              )
            : t("appointments.success", "Cita programada exitosamente"),
        );

        // Invalidar el cache de citas para recargar el calendario
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CITAS() });

        navigate("/dashboard", { replace: true });
      } else {
        throw new Error(response?.message || "Error al crear la cita");
      }
    } catch (error: any) {
      console.error("Error al programar cita desde página de resumen:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t(
            "appointments.error",
            "Error al programar la cita. Por favor intenta nuevamente.",
          ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className={`bg-background min-h-screen ${isMobile ? "py-4 px-4" : "py-10"} flex gap-4 rounded-4xl`}
    >
      <div
        className={`w-full ${isMobile ? "flex flex-col" : "grid grid-cols-[1fr_7fr_1fr]"} justify-items-center`}
      >
        <aside className={isMobile ? "w-full mb-4" : ""}>
          <MCBackButton onClick={() => navigate(-1)} />
        </aside>

        {loading ? (
          <ScheduleAppointmentSkeleton isMobile={isMobile} />
        ) : (
          <main
            className={`${isMobile ? "w-full" : "max-w-2xl"} flex flex-col gap-4`}
          >
            <div className="flex items-center justify-between">
              <h1
                className={`${isMobile ? "text-2xl" : "text-3xl"} font-semibold text-primary`}
              >
                {appointmentDetails.appointmentId
                  ? t("appointments.reschedule", "Reschedule Appointment")
                  : t("appointments.details", "Confirm Appointment")}
              </h1>
              <div className="flex items-center gap-2">
                <ScheduleAppointmentDialog
                  idProvider={appointmentDetails.doctorId}
                  serviceData={serviceData || undefined}
                  idAppointment={appointmentDetails?.appointmentId}
                >
                  <MCButton size="sm" variant="outline">
                    {t("appointments.reschedule", "Edit Appointment")}
                  </MCButton>
                </ScheduleAppointmentDialog>
              </div>
            </div>

            <div
              className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-[4.5fr_5.5fr]"} gap-4 items-start`}
            >
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={
                    serviceData?.imagenes?.[0]?.url ||
                    "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?auto=format&fit=crop&w=400&q=80"
                  }
                  alt={
                    serviceData?.nombre ||
                    t("appointments.reason", "Medical Consultation")
                  }
                  className={`w-full ${isMobile ? "h-48" : "h-60"} object-cover rounded-xl transition-transform duration-500 hover:scale-110`}
                />
              </div>
              <div>
                <h2
                  className={`${isMobile ? "text-lg" : "text-xl"} font-bold text-primary`}
                >
                  {serviceData?.nombre ||
                    t("doctors.profile", "General Dermatology Consultation")}
                </h2>
                <p className="text-primary opacity-75 mb-4">
                  {serviceData?.descripcion ||
                    t(
                      "appointments.reasonPlaceholder",
                      "Complete skin evaluation to detect and treat spots, acne, moles, or other conditions. Includes initial diagnosis and personalized recommendations.",
                    )}
                </p>
              </div>
            </div>
            <div>
              <h4
                className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-primary`}
              >
                {t(
                  "appointments.cancellationPolicyTitle",
                  "Flexible cancellation and rescheduling policy",
                )}
              </h4>
              <p
                className={`text-primary opacity-75 ${isMobile ? "text-sm" : ""}`}
              >
                {t(
                  "appointments.cancellationPolicyDescription",
                  "You can cancel or reschedule your appointment at no additional cost if you do so at least 4 hours in advance. Our goal is to offer you the greatest comfort and flexibility in your medical care.",
                )}
              </p>
            </div>
            <hr className="border-t border-primary opacity-15" />
            <div
              className={`flex ${isMobile ? "flex-flex gap-2 justify-between items-center" : "justify-between"}`}
            >
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-secondary" />
                  <h5 className="font-semibold text-primary">
                    {t("appointments.date", "Date")}
                  </h5>
                </div>
                <div>
                  <span className="text-primary opacity-75">
                    {appointmentDetails.date}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-secondary" />
                  <h5 className="font-semibold text-primary">
                    {t("appointments.time", "Time")}
                  </h5>
                </div>
                <div>
                  <span className="text-primary opacity-75">
                    {formatTimeTo12h(appointmentDetails.time)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <PersonStanding size={20} className="text-secondary" />
                  <h5 className="font-semibold text-primary">
                    {t("appointments.patient", "Patients")}
                  </h5>
                </div>
                <div>
                  <span className="text-primary opacity-75">
                    {appointmentDetails.numberOfSessions}{" "}
                    {t("appointments.patient", "Patient")}
                    {appointmentDetails.numberOfSessions > 1
                      ? t("appointments.patient_plural", "s")
                      : ""}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4
                className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-primary`}
              >
                {t("appointments.reason", "Reason for Consultation")}
              </h4>
              <p
                className={`text-primary opacity-75 ${isMobile ? "text-sm" : ""}`}
              >
                {appointmentDetails.reason}
              </p>
            </div>
            <hr className="border-t border-primary opacity-15" />
            <section>
              {appointmentDetails.selectedModality === "presencial" ? (
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <MapPinCheck size={20} className="text-secondary mb-2" />
                    <h4
                      className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-primary mb-1`}
                    >
                      {t("appointments.inPerson", "Location")}
                    </h4>
                  </div>
                  {primaryLocation ? (
                    <>
                      <p className="text-sm text-primary opacity-75 mb-3">
                        <strong>{primaryLocation.nombre}</strong> -{" "}
                        {primaryLocation.direccion}
                        {primaryLocation.barrio && (
                          <>
                            , {primaryLocation.barrio.nombre},{" "}
                            {primaryLocation.barrio.seccion.municipio.nombre},{" "}
                            {
                              primaryLocation.barrio.seccion.municipio.provincia
                                .nombre
                            }
                          </>
                        )}
                      </p>
                      {primaryLocation.latitud !== undefined &&
                      primaryLocation.longitud !== undefined &&
                      !isNaN(primaryLocation.latitud) &&
                      !isNaN(primaryLocation.longitud) &&
                      isFinite(primaryLocation.latitud) &&
                      isFinite(primaryLocation.longitud) ? (
                        <MapScheduleLocation
                          initialLocation={{
                            lat: primaryLocation.latitud,
                            lng: primaryLocation.longitud,
                          }}
                        />
                      ) : (
                        <MapScheduleLocation
                          initialLocation={{
                            lat: 18.47267,
                            lng: -69.94101,
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <MapScheduleLocation
                      initialLocation={{
                        lat: 18.47267,
                        lng: -69.94101,
                      }}
                    />
                  )}
                </div>
              ) : (
                <div>
                  <h4
                    className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-primary mb-1`}
                  >
                    {t("appointments.virtual", "Virtual consultation platform")}
                  </h4>
                  <p
                    className={`text-primary opacity-75 ${isMobile ? "text-sm" : ""}`}
                  >
                    {t(
                      "appointments.virtualDescription",
                      "The consultation will take place through our secure telemedicine platform. You will receive a link by email before the appointment.",
                    )}
                  </p>
                </div>
              )}
            </section>

            <hr className="border-t border-primary opacity-15" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Stethoscope size={20} className="text-secondary" />
                <h4 className="text-primary font-semibold">
                  {t("doctors.profile", "Attending Physician")}
                </h4>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className={`relative overflow-hidden rounded-full border border-primary/5 ${isMobile ? "w-16 h-16" : "w-24 h-24"} mb-2`}
                >
                  {doctorAvatar ? (
                    <img
                      src={doctorAvatar}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      alt={doctorFullName}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full rounded-full">
                      <MCUserAvatar
                        name={doctorFullName}
                        size={isMobile ? 64 : 128}
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <h3
                    className={`font-semibold text-primary ${isMobile ? "text-base" : "text-lg"}`}
                  >
                    {doctorFullName}
                  </h3>
                  <p
                    className={`text-primary opacity-75 ${isMobile ? "text-xs" : "text-sm"}`}
                  >
                    {doctorSpecialty}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck size={20} className="text-secondary" />
                <span
                  className={`flex items-center text-primary ${isMobile ? "text-sm" : ""}`}
                >
                  <p className="mr-2 font-semibold">
                    {t("insurance.title", "Medical Insurance")}:
                  </p>
                  {insuranceName}
                </span>
              </div>
            </div>
            <hr className="border-t border-primary opacity-15" />
            <div
              className={`w-full flex ${isMobile ? "flex-flex gap-2 justify-between items-center" : "justify-between items-center"}`}
            >
              <h1
                className={`${isMobile ? "text-xl" : "text-2xl"} font-semibold text-primary`}
              >
                {t("appointments.total", "Total:")}
              </h1>
              <span
                className={`${isMobile ? "text-xl" : "text-2xl"} font-semibold text-primary`}
              >
                {formatCurrency(
                  serviceData?.precio
                    ? serviceData.precio * appointmentDetails.numberOfSessions
                    : undefined,
                )}
              </span>
            </div>
            <MCButton
              className="w-full"
              size={isMobile ? "xl" : "l"}
              variant="primary"
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("appointments.submitting", "Procesando...")}
                </>
              ) : appointmentDetails.appointmentId ? (
                t("appointments.reschedule", "Reschedule appointment")
              ) : (
                t("appointments.schedule", "Confirm appointment")
              )}
            </MCButton>
          </main>
        )}
        {!isMobile && <div />}
      </div>
    </motion.div>
  );
}

export default ScheduleAppointment;
