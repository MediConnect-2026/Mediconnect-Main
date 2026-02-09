import type { CenterPersonalInfo } from "@/schema/verifyInfo.schema";
import MapScheduleLocation from "@/shared/components/maps/MapScheduleLocation";
interface CenterReadOnlyViewProps {
  data: CenterPersonalInfo;
}

function CenterReadOnlyView({ data }: CenterReadOnlyViewProps) {
  return (
    <main className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            Nombre del Centro
          </p>
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
      </div>{" "}
      <div className="flex flex-col w-full">
        <MapScheduleLocation
          fontSizeVariant="s"
          initialLocation={{
            lat: data.coordinates.latitude,
            lng: data.coordinates.longitude,
          }}
        ></MapScheduleLocation>
      </div>
    </main>
  );
}

export default CenterReadOnlyView;
