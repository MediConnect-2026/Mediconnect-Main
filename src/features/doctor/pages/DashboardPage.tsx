import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/shared/ui/card";
import { AppointmentsCalendar } from "@/shared/components/calendar/AppointmentsCalendar";
import MCMetricCard from "@/shared/components/MCMetricCard";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import { UsersIcon, CalendarCheckIcon, DollarSignIcon } from "lucide-react";
import DashboardTable from "../components/dashboard/DashboardTable";
import MCTablesLayouts from "@/shared/components/tables/MCTablesLayouts";
function DashboardPage() {
  const isMobile = useIsMobile();
  const { t } = useTranslation("patient");

  return (
    <motion.main {...fadeInUp} className="min-h-screen">
      <div className="flex flex-col gap-4">
        <main className="grid grid-cols-[7fr_3fr] h-[800px] gap-4">
          <div id="cards" className="flex flex-col gap-4 h-full">
            <div className="flex gap-4 flex-shrink-0">
              <MCMetricCard
                title="Total de Pacientes"
                icon={<UsersIcon />}
                value={412}
                subtitle="Cantidad total de pacientes atendidos este mes."
                percentage="12%"
                bordered
              />
              <MCMetricCard
                title="Total de Consultas"
                icon={<CalendarCheckIcon />}
                value={285}
                subtitle="Cantidad total de consultas realizadas este mes."
                percentage="8%"
                bordered
              />
              <MCMetricCard
                title="Total Ganado"
                icon={<DollarSignIcon />}
                value="RD$ 87,500"
                subtitle="Monto total generado durante este mes."
                percentage="15%"
                bordered
              />
            </div>
            <Card className="rounded-2xl md:rounded-4xl flex-1 min-h-0 overflow-hidden">
              <MCTablesLayouts
                isDashboard
                title="Gestion de Citas"
                tableComponent={<DashboardTable />}
              />
            </Card>
          </div>
          <Card className="rounded-2xl md:rounded-4xl h-full overflow-hidden">
            <AppointmentsCalendar orientation="vertical" />
          </Card>
        </main>
      </div>
    </motion.main>
  );
}

export default DashboardPage;
