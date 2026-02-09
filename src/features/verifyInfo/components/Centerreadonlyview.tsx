import React from "react";
import type { CenterPersonalInfo } from "@/schema/verifyInfo.schema";

interface CenterReadOnlyViewProps {
  data: CenterPersonalInfo;
}

function CenterReadOnlyView({ data }: CenterReadOnlyViewProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <p className="text-sm text-muted-foreground mb-1">Nombre del Centro</p>
        <p className="font-medium text-foreground">{data.name}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Tipo de Centro</p>
        <p className="font-medium text-foreground">{data.centerType}</p>
      </div>
      <div className="col-span-2">
        <p className="text-sm text-muted-foreground mb-1">Descripción</p>
        <p className="font-medium text-foreground">{data.description}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Email</p>
        <p className="font-medium text-foreground">{data.email}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Teléfono</p>
        <p className="font-medium text-foreground">{data.phone}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Sitio Web</p>
        <p className="font-medium text-foreground">{data.website || "-"}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">RNC</p>
        <p className="font-medium text-foreground">{data.rnc}</p>
      </div>
      <div className="col-span-2">
        <p className="text-sm text-muted-foreground mb-1">Dirección</p>
        <p className="font-medium text-foreground">{data.address}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Provincia</p>
        <p className="font-medium text-foreground">{data.province}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Municipio</p>
        <p className="font-medium text-foreground">{data.municipality}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Coordenadas</p>
        <p className="font-medium text-foreground">
          {data.coordinates.latitude}, {data.coordinates.longitude}
        </p>
      </div>
    </div>
  );
}

export default CenterReadOnlyView;
