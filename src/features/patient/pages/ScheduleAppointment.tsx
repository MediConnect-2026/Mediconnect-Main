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
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MapScheduleLocation from "@/shared/components/maps/MapScheduleLocation";

import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import ScheduleAppointmentDialog from "../components/appoiments/ScheduleAppointmentDialog";
function ScheduleAppointment() {
  const { t } = useTranslation("patient");
  const user = useAppStore((state) => state.user);
  const appointmentDetails = useAppointmentStore((state) => state.appointment);

  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const isPatient = user?.role === "PATIENT";

  useEffect(() => {
    if (!isPatient) {
      navigate("/search", { replace: true });
    }
  }, [isPatient, navigate]);

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
        <main
          className={`${isMobile ? "w-full" : "max-w-2xl"} flex flex-col gap-4`}
        >
          <div className="flex items-center justify-between">
            <h1
              className={`${isMobile ? "text-2xl" : "text-3xl"} font-semibold text-primary`}
            >
              {t("appointments.details", "Confirm Appointment")}
            </h1>
            <p>prueba {appointmentDetails.doctorId}</p>
            <div className="flex items-center gap-2">
              <ScheduleAppointmentDialog
                idProvider={appointmentDetails.doctorId}
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
                src="https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?auto=format&fit=crop&w=400&q=80"
                alt={t("appointments.reason", "Medical Consultation")}
                className={`w-full ${isMobile ? "h-48" : "h-60"} object-cover rounded-xl transition-transform duration-500 hover:scale-110`}
              />
            </div>
            <div>
              <h2
                className={`${isMobile ? "text-lg" : "text-xl"} font-bold text-primary`}
              >
                {t("doctors.profile", "General Dermatology Consultation")}
              </h2>
              <p className="text-primary opacity-75 mb-4">
                {t(
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
                  {appointmentDetails.time}
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
                <MapScheduleLocation
                  initialLocation={{
                    lat: 18.47267,
                    lng: -69.94101,
                  }}
                />
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
                {!user.avatar ? (
                  <img
                    src="https://i.pinimg.com/736x/28/c4/8d/28c48d2fbae708baff8261b51e30627b.jpg"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    alt={t("doctors.profile", "Doctor")}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full rounded-full">
                    <MCUserAvatar
                      name={user.name || t("doctors.profile", "Doctor")}
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
                  {user.name || t("doctors.profile", "DR. CRISTIANO RONALDO")}
                </h3>
                <p
                  className={`text-primary opacity-75 ${isMobile ? "text-xs" : "text-sm"}`}
                >
                  {t("doctors.specialty", "Internal Medicine Specialist")}
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
                {appointmentDetails.insuranceProvider}
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
              RD$ 2,500.00
            </span>
          </div>
          <MCButton
            className="w-full"
            size={isMobile ? "xl" : "l"}
            variant="primary"
          >
            {t("appointments.schedule", "Confirm appointment")}
          </MCButton>
        </main>
        {!isMobile && <div />}
      </div>
    </motion.div>
  );
}

export default ScheduleAppointment;
