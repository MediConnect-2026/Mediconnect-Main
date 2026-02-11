import { useTranslation } from "react-i18next";
import type { CenterPersonalInfo } from "@/schema/verifyInfo.schema";
import MapScheduleLocation from "@/shared/components/maps/MapScheduleLocation";

interface CenterReadOnlyViewProps {
  data: CenterPersonalInfo;
}

function CenterReadOnlyView({ data }: CenterReadOnlyViewProps) {
  const { t } = useTranslation("common");

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
            {data.centerType}
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
          <p className="font-medium text-foreground">{data.phone}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            {t("verification.identification.website")}
          </p>
          <p className="font-medium text-foreground break-words">
            {data.website || "-"}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            {t("verification.identification.rnc")}
          </p>
          <p className="font-medium text-foreground">{data.rnc}</p>
        </div>
      </div>

      <div className="flex flex-col w-full">
        <MapScheduleLocation
          fontSizeVariant="s"
          initialLocation={{
            lat: data.coordinates.latitude,
            lng: data.coordinates.longitude,
          }}
        />
      </div>
    </main>
  );
}

export default CenterReadOnlyView;
