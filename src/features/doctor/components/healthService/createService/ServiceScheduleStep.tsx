import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import ServicesLayoutsSteps from "./ServicesLayoutsSteps";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { ChevronRight } from "lucide-react";
import MCButton from "@/shared/components/forms/MCButton";
import { Button } from "@/shared/ui/button";
import { useState } from "react";
import ManageSchedule from "./Modals/ManageSchedule";
const schedules = [
  {
    id: 1,
    name: "Clinica del Dr. Abreu",
    schedule: {
      firstDay: "Lunes",
      firstHour: "8:00 AM",
      lastDay: "Viernes",
      lastHour: "5:00 PM",
    },
  },
  {
    id: 2,
    name: "Centro Médico UCE",
    schedule: {
      firstDay: "Lunes",
      firstHour: "9:00 AM",
      lastDay: "Viernes",
      lastHour: "6:00 PM",
    },
  },
  {
    id: 3,
    name: "Centro Médico Moderno",
    schedule: {
      firstDay: "Lunes",
      firstHour: "7:00 AM",
      lastDay: "Viernes",
      lastHour: "4:00 PM",
    },
  },
];

function ServiceScheduleStep() {
  const comercialScheduleSelected = useCreateServicesStore(
    (s) => s.createServiceData.comercial_schedule,
  );
  const setComercialScheduleData = useCreateServicesStore(
    (s) => s.setCreateServiceField,
  );
  const goToNextStep = useCreateServicesStore((s) => s.goToNextStep);
  const goToPreviousStep = useCreateServicesStore((s) => s.goToPreviousStep);

  return (
    <ServicesLayoutsSteps
      title="Establece tu horario"
      description="Empieza con una opción accesible para atraer a más pacientes y optimizar tu agenda de manera eficiente."
    >
      <div
        className={`w-full ${schedules.length > 6 ? "max-h-80 overflow-y-auto" : ""}`}
      >
        <div className="grid grid-cols-2 gap-4">
          {schedules.map((item) => (
            <div
              key={item.id}
              className={`border w-full border-primary/15 p-3 rounded-2xl flex items-center justify-between cursor-pointer transition
                ${Array.isArray(comercialScheduleSelected) && comercialScheduleSelected.includes(item.id) ? "bg-accent/50 border-none" : ""}
              `}
              onClick={() =>
                setComercialScheduleData(
                  "comercial_schedule",
                  Array.isArray(comercialScheduleSelected)
                    ? comercialScheduleSelected.includes(item.id)
                      ? comercialScheduleSelected.filter((id) => id !== item.id)
                      : [...comercialScheduleSelected, item.id]
                    : [item.id],
                )
              }
            >
              <div className="flex flex-col gap-1 max-w-[220px]">
                <p className="text-base font-medium truncate">{item.name}</p>
                <p className="text-sm font-normal truncate">
                  {item.schedule.firstDay} {item.schedule.firstHour} -{" "}
                  {item.schedule.lastDay} {item.schedule.lastHour}
                </p>
              </div>
              <ManageSchedule locationSelected={item.id}>
                <Button
                  variant="outline"
                  className="rounded-4xl p-2 border-none bg-transparent shadow-none text-primary/75 hover:bg-primary/10 hover:text-primary focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
                >
                  <ChevronRight />
                </Button>{" "}
              </ManageSchedule>
            </div>
          ))}
        </div>
      </div>
      <ManageSchedule>
        <MCButton className="w-full rounded-xl mt-6" variant="tercero">
          Agregar Horario
        </MCButton>
      </ManageSchedule>
      <AuthFooterContainer
        continueButtonProps={{
          disabled: !comercialScheduleSelected,
          onClick: () => goToNextStep(),
        }}
        backButtonProps={{
          onClick: () => goToPreviousStep(),
        }}
      />
    </ServicesLayoutsSteps>
  );
}

export default ServiceScheduleStep;
