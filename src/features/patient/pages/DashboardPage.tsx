import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import MCButton from "@/shared/components/forms/MCButton";
import MCBackButton from "@/shared/components/forms/MCBackButton";
import MCInput from "@/shared/components/forms/MCInput";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import MCFilterInput from "@/shared/components/filters/MCFilterInput";
import MCDoctorsCards from "@/shared/components/MCDoctorsCards";
import { Search } from "lucide-react";
import { AppointmentsCalendar } from "@/shared/components/calendar/AppointmentsCalendar";
import DoctorSearchBar from "../components/DoctorSearchBar";
import MyInsurance from "../components/dashboard/MyInsurance";
import MyDoctors from "../components/dashboard/MyDoctors";
function DashboardPage() {
  return (
    <main className="  min-h-screen">
      <div className=" mx-auto space-y-6">
        {/* BUSCADOR SUPERIOR */}
        <div className=" rounded-4xl p-12 w-full flex flex-col items-center bg-accent-foreground ">
          <h1 className="text-4xl font-semibold text-background dark:text-primary mb-4">
            Busca médicos, especialidades o clínicas cercanas
          </h1>

          <div className="w-full">
            <DoctorSearchBar />
          </div>
        </div>

        {/* FILA 1: CALENDARIO + SEGUROS */}
        <div className="grid grid-cols-[7fr_3fr] gap-6 w-full">
          {/* Calendario + citas */}
          <Card className="rounded-4xl">
            <AppointmentsCalendar />
          </Card>
          {/* Mis seguros */}
          <Card className="rounded-4xl">
            <MyInsurance></MyInsurance>
          </Card>
        </div>

        {/* FILA 2: DOCTORES + HISTORIA CLÍNICA */}
        <div className="grid grid-cols-[7fr_3fr] gap-6 w-full">
          <Card className="rounded-4xl">
            <MyDoctors />
          </Card>
          <Card className="rounded-4xl">
            <MyInsurance></MyInsurance>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default DashboardPage;
