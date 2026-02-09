import React from "react";
import type { DoctorPersonalInfo } from "@/schema/verifyInfo.schema";

interface DoctorReadOnlyViewProps {
  data: DoctorPersonalInfo;
}

function DoctorReadOnlyView({ data }: DoctorReadOnlyViewProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <p className="text-sm text-muted-foreground mb-1">Nombre(s)</p>
        <p className="font-medium text-foreground">{data.firstName}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Apellidos</p>
        <p className="font-medium text-foreground">{data.lastName}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Género</p>
        <p className="font-medium text-foreground">{data.gender}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Email</p>
        <p className="font-medium text-foreground">{data.email}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Nacionalidad</p>
        <p className="font-medium text-foreground">{data.nationality}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          Número de Identificación
        </p>
        <p className="font-medium text-foreground">
          {data.identificationNumber}
        </p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Teléfono</p>
        <p className="font-medium text-foreground">{data.phone}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Dirección Física</p>
        <p className="font-medium text-foreground">{data.address}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          Especialidad Principal
        </p>
        <p className="font-medium text-foreground">{data.primarySpecialty}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          Especialidad Secundaria
        </p>
        <p className="font-medium text-foreground">
          {data.secondarySpecialty || "-"}
        </p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Exequátur Médico</p>
        <p className="font-medium text-foreground">{data.medicalLicense}</p>
      </div>
    </div>
  );
}

export default DoctorReadOnlyView;
