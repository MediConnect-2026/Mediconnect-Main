import {
  Calendar,
  Clock,
  Stethoscope,
  MapPin,
  History,
  FileText,
  User,
  File,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
const consultationData = {
  doctor: {
    name: "Dr. Cristiano Ronaldo",
    specialty: "Especialista en Medicina Interna",
    avatar: "", // Puedes agregar una URL de imagen aquí
  },
  date: "15 de octubre, 2025",
  time: "10:00 AM - 10:45 AM",
  type: "Plan Nutricional",
  location: "Consultorio 305, sede Centro",
};

const additionalSections = [
  { icon: History, label: "Citas pasadas" },
  { icon: FileText, label: "Última Consulta" },
  { icon: User, label: "Detalle del Paciente" },
  { icon: File, label: "Detalles de la cita" },
];

export const ConsultationInfo = () => {
  return (
    <div className="bg-background p-6 rounded-2xl border border-primary/15 shadow-sm">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Información de la consulta
          </h3>

          <div className="flex items-center gap-4 mb-6 bg-background border border-none rounded-3xl">
            <div className="h-20 w-20 relative overflow-hidden rounded-full border border-primary/10 bg-muted flex items-center justify-center">
              {consultationData.doctor.avatar ? (
                <Avatar className="h-20 w-20 rounded-full overflow-hidden">
                  <AvatarImage
                    src={consultationData.doctor.avatar}
                    alt={consultationData.doctor.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {consultationData.doctor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <MCUserAvatar
                  name={consultationData.doctor.name}
                  square={false}
                  size={80}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              )}
            </div>
            <div>
              <p className="font-medium">{consultationData.doctor.name}</p>
              <p className="text-sm text-muted-foreground">
                {consultationData.doctor.specialty}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-secondary" />
              <span>{consultationData.date}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-secondary" />
              <span>{consultationData.time}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Stethoscope className="w-4 h-4 text-secondary" />
              <span>{consultationData.type}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-secondary" />
              <span>{consultationData.location}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Secciones Adicionales</h3>
          <div className="space-y-4">
            {additionalSections.map((section, index) => (
              <button
                key={index}
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-left"
              >
                <section.icon className="w-4 h-4 text-secondary" />
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
