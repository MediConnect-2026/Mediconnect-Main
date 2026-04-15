import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useProfileStore } from "@/stores/useProfileStore";
import { profileVisibilitySchema } from "@/schema/account.schema";
import { useNavigate } from "react-router-dom";

import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";

function ProfileVisibilityPage() {
  const { t } = useTranslation("common");
  const isMobile = useIsMobile();
  const profileVisibility = useProfileStore(
    (state) => state.profileVisibilityData,
  );
  const setProfileVisibility = useProfileStore(
    (state) => state.setProfileVisibilityData,
  );
  const navigate = useNavigate();

  const handleSubmitSuccess = (data: {
    visibility: "PUBLIC" | "PRIVATE" | "RELATIONSHIPS_ONLY";
  }) => {
    setProfileVisibility({
      ...profileVisibility,
      visibility: data.visibility,
    });
    // Aquí deberías llamar a tu API para actualizar la visibilidad del perfil
    navigate("/account");
  };

  return (
    <MCDashboardContent mainWidth={isMobile ? "w-full" : "max-w-2xl"}>
      <div className="flex flex-col gap-6 items-center justify-center w-full mb-8">
        <div
          className={`w-full flex flex-col gap-2 justify-center items-center ${isMobile ? "min-w-0" : "min-w-xl"}`}
        >
          <h1
            className={`${isMobile ? "text-3xl" : "text-5xl"} font-medium mb-2 text-center`}
          >
            {t("profileVisibility.title")}
          </h1>
          <p className="text-muted-foreground text-base max-w-md text-center">
            {t("profileVisibility.description")}
          </p>
          <MCFormWrapper
            schema={profileVisibilitySchema(t)}
            onSubmit={handleSubmitSuccess}
            defaultValues={{
              visibility: profileVisibility?.visibility || "PUBLIC",
            }}
            className={`mt-4 flex flex-col items-center gap-4 h-full ${isMobile ? "w-full" : "w-md"}`}
          >
            <MCSelect
              name="visibility"
              options={[
                {
                  label: t("profileVisibility.public"),
                  value: "PUBLIC",
                },
                {
                  label: t("profileVisibility.relationshipsOnly"),
                  value: "RELATIONSHIPS_ONLY",
                },
                {
                  label: t("profileVisibility.private"),
                  value: "PRIVATE",
                },
              ]}
              className="w-full"
            />
          </MCFormWrapper>
        </div>
      </div>
    </MCDashboardContent>
  );
}

export default ProfileVisibilityPage;
