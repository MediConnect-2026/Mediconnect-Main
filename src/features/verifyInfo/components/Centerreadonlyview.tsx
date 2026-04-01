import { useTranslation } from "react-i18next";
import type { CenterPersonalInfo } from "@/schema/verifyInfo.schema";
import MapScheduleLocation from "@/shared/components/maps/MapScheduleLocation";
import { formatPhone } from "@/utils/phoneFormat";

interface CenterReadOnlyViewProps {
  data: CenterPersonalInfo;
}

function CenterReadOnlyView({ data }: CenterReadOnlyViewProps) {
  const { t } = useTranslation("common");

  console.log("CenterReadOnlyView data:", data);
  return (
    <main className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            {t("verification.identification.centerName")}
          </p>
          <p className="font-medium text-foreground break-words">{data.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            {t("verification.identification.centerType")}
          </p>
          <p className="font-medium text-foreground break-words">
            {data.centerTypeLabel || data.centerType}
          </p>
        </div>
        <div className="col-span-1 sm:col-span-2">
          <p className="text-sm text-muted-foreground mb-1">
            {t("verification.identification.description_field")}
          </p>
          <p className="font-medium text-foreground break-words">
            {data.description}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            {t("verification.identification.email")}
          </p>
          <p className="font-medium text-foreground break-words">
            {data.email}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            {t("verification.identification.phone")}
          </p>
          <p className="font-medium text-foreground">{formatPhone(data.phone, { emptyValue: "-" })}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            {t("verification.identification.website")}
          </p>
            <a
              href={data.website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground break-words text-blue-600 hover:underline"
            >
              {data.website || "-"}
            </a>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            {t("verification.identification.rnc")}
          </p>
            <p className="font-medium text-foreground">
            {data.rnc ? `${data.rnc.slice(0, 3)}-${data.rnc.slice(3, 10)}-${data.rnc.slice(10)}` : "-"}
            </p>
        </div>
      </div>

      <div className="flex flex-col w-full">
        {data.coordinates?.latitude !== undefined &&
         data.coordinates?.longitude !== undefined &&
         !isNaN(data.coordinates.latitude) &&
         !isNaN(data.coordinates.longitude) &&
         isFinite(data.coordinates.latitude) &&
         isFinite(data.coordinates.longitude) ? (
          <MapScheduleLocation
            fontSizeVariant="s"
            initialLocation={{
              lat: data.coordinates.latitude,
              lng: data.coordinates.longitude,
            }}
          />
        ) : (
          <div className="w-full h-[300px] rounded-xl border-2 border-dashed border-primary/20 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              {t("verification.location.noLocation", "Ubicación no disponible")}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default CenterReadOnlyView;
