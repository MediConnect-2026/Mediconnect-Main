import { useTranslation } from "react-i18next";
import MCBackButton from "@/shared/components/forms/MCBackButton";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import { Calendar, Clock, PersonStanding } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { useAppointmentStore } from "@/stores/useAppointmentStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ScheduleAppointment() {
  const { t } = useTranslation();
  const user = useAppStore((state) => state.user);
  const appointmentDetails = useAppointmentStore((state) => state.appointment);
  const navigate = useNavigate();

  console.log(appointmentDetails.date); // Now this should work

  return (
    <div className="bg-background min-h-screen py-10 flex gap-4 rounded-4xl">
      <div className="w-full grid grid-cols-[1fr_7fr_1fr] justify-items-center ">
        <aside>
          <MCBackButton />
        </aside>
        <main className=" max-w-2xl flex flex-col gap-4">
          <h1 className="text-3xl font-semibold text-primary">
            Confirmar Cita
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-[4.5fr_5.5fr] gap-4 items-start">
            <img
              src="https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?auto=format&fit=crop&w=400&q=80"
              alt="Consulta médica"
              className="w-full  h-60 object-cover rounded-xl shadow"
            />
            <div>
              <h2 className="text-xl font-bold text-primary">
                Consulta dermatológica general
              </h2>
              <p className="text-primary opacity-75 mb-4">
                Evaluación completa de la piel para detectar y tratar manchas,
                acné, lunares u otras afecciones. Incluye diagnóstico inicial y
                recomendaciones personalizadas.
              </p>
            </div>
          </div>
          <div className="">
            <h4 className="text-lg font-semibold text-primary ">
              Política de cancelación y reprogramación flexible
            </h4>
            <p className="text-primary opacity-75">
              Puedes cancelar o reprogramar tu cita sin costo adicional si lo
              haces con al menos 4 horas de antelación. Nuestro objetivo es
              ofrecerte la mayor comodidad y flexibilidad en tu atención médica.
            </p>
          </div>
          <div className="flex justify-between">
            <div className="flex  flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-secondary" />{" "}
                <h5 className="font-semibold text-primary">Fecha</h5>
              </div>
              <div>
                <span className="text-primary opacity-75">
                  {appointmentDetails.date || "Jueves, 16 de oct de 2025"}
                </span>
              </div>
            </div>
            <div className="flex  flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-secondary" />{" "}
                <h5 className="font-semibold text-primary">Horario</h5>
              </div>
              <div>
                <span className="text-primary opacity-75">
                  {appointmentDetails.time || "De 10:00 a.m. a 10:30 a.m."}
                </span>
              </div>
            </div>
            <div className="flex  flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <PersonStanding size={20} className="text-secondary" />
                <h5 className="font-semibold text-primary">Pacientes</h5>
              </div>
              <div>
                <span className="text-primary opacity-75">
                  {appointmentDetails.numberOfSessions} Paciente(s)
                </span>
              </div>
            </div>
          </div>
          <div className="">
            <h4 className="text-lg font-semibold text-primary mb-1">
              Motivo de la consulta
            </h4>
            <p className="text-primary opacity-75">
              {appointmentDetails.reason ||
                "He notado manchas oscuras en mi cara desde hace unas semanas y me gustaría saber qué las causa y cómo tratarlas."}
            </p>
          </div>
        </main>
        <div />
      </div>
    </div>
  );
}

export default ScheduleAppointment;
