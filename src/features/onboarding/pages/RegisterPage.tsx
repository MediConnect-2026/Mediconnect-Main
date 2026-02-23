import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import AuthContentContainer from "@/features/auth/components/AuthContentContainer";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useAppStore } from "@/stores/useAppStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

const roles = [
  {
    key: "Patient",
    img: "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771695711/ONB-PATIENT_ie2wcu.png",
  },
  {
    key: "Doctor",
    img: "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771695704/ONB-DOCTOR_o0xr6m.png",
  },
  {
    key: "Center",
    img: "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771699015/CenterImgREP2_vn0amw.png",
  },
];

function RegisterPage() {
  const [hovered, setHovered] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const setRoleInStore = useAppStore((state) => state.setSelectedRole);
  const selectedRole = useAppStore((state) => state.selectedRole);
  const detailsRefs = useRef<Record<string, HTMLUListElement | null>>({});
  const resetFlows = useAppStore((state) => state.clearOnboarding);
  const clearAuthFlow = useAppStore((state) => state.clearAuthFlow);

  const handleselectRole = (roleKey: "Patient" | "Doctor" | "Center") => {
    if (selectedRole !== roleKey) {
      resetFlows();
      clearAuthFlow();
      setRoleInStore(roleKey);
    }
  };

  useEffect(() => {
    if (hovered && detailsRefs.current[hovered] && selectedRole !== hovered) {
      const items = detailsRefs.current[hovered]?.querySelectorAll("li");
      if (items && items.length > 0) {
        gsap.fromTo(
          items,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.22,
            ease: "power1.out",
            stagger: 0.08,
          },
        );
      }
    }
  }, [hovered, selectedRole]);

  return (
    <AuthContentContainer
      title={t("registerRole.title")}
      subtitle={t("registerRole.subtitle")}
      containerClassName="max-w-6xl "
    >
      <div
        className={`flex flex-col ${
          isMobile ? "" : "sm:flex-row"
        } gap-6 justify-center items-center w-full max-w-5xl   `}
      >
        {roles.map((role) => {
          const isHovered = hovered === role.key;
          const isSelected = selectedRole === role.key;
          const roleT = (field: string) =>
            t(`registerRole.roles.${role.key}.${field}`);
          const detailsRaw = t(`registerRole.roles.${role.key}.details`, {
            returnObjects: true,
          });
          const details = Array.isArray(detailsRaw) ? detailsRaw : [];

          return (
            <div
              key={role.key}
              className={`relative rounded-3xl  overflow-hidden shadow-lg transition-all duration-300
                w-full ${isMobile ? "" : "sm:w-1/3"} cursor-pointer group
                ${
                  isSelected
                    ? "outline outline-8 outline-accent shadow-[0_0_40px_10px_rgba(0,180,255,0.5)]"
                    : isHovered
                      ? "outline outline-4 outline-accent shadow-2xl"
                      : ""
                }
              `}
              onMouseEnter={() => setHovered(role.key)}
              onMouseLeave={() => setHovered(null)}
              onClick={() =>
                handleselectRole(role.key as "Patient" | "Doctor" | "Center")
              }
              style={{
                minWidth: isMobile ? "100%" : 320,
                maxWidth: isMobile ? "100%" : 400,
                height: isMobile ? 420 : 560,
              }}
            >
              <img
                src={role.img}
                alt={roleT("title")}
                className={`w-full h-full object-cover transition-transform duration-500 rounded-3xl group-hover:scale-110 hover:scale-110`}
                style={{ objectPosition: isMobile ? "top" : "center" }}
              />
              {/* Overlay degradado */}
              <div
                className={`absolute  overflow-y-hidden inset-0 bg-gradient-to-t from-black/20 via-black/10 to-transparent ${
                  isHovered || isSelected
                    ? "opacity-from-black/60 via-black/20"
                    : ""
                }`}
              />
              {/* Título y subtítulo */}
              <div className="absolute top-6 left-0 w-full px-6 ">
                <p
                  className={`text-white text-base font-medium mb-2 drop-shadow text-center transition-all duration-200
                    ${isSelected ? "font-bold text-xl" : ""}
                    ${isHovered || isSelected ? "scale-105" : ""}
                  `}
                >
                  {isSelected ? t("registerRole.selected") : roleT("subtitle")}
                </p>
              </div>
              <div className="absolute bottom-0 left-0 w-full px-6 pb-6">
                <h2
                  className={`text-white text-2xl font-bold mb-2 drop-shadow transition-all duration-200
                    ${isHovered || isSelected ? "scale-105" : ""}
                  `}
                >
                  {roleT("title")}
                </h2>
                <p
                  className={`text-white text-base mb-2 drop-shadow transition-all duration-200
                    ${isHovered || isSelected ? "scale-105" : ""}
                  `}
                >
                  {roleT("desc")}
                </p>
                {(isHovered || isSelected) && details.length > 0 && (
                  <ul
                    ref={(el) => {
                      detailsRefs.current[role.key] = el;
                    }}
                    className={`text-white text-sm mb-2 list-disc pl-5 transition-all duration-200
                      ${isMobile && isSelected ? "animate-fade-in" : ""}
                    `}
                  >
                    {details.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center items-center w-full p-6 ">
        <div className="w-[95%] flex justify-center items-center ">
          <AuthFooterContainer
            continueButtonProps={{
              children: t("footer.continue"),
              onClick: () => navigate("/auth/reg-email-verification"),
              disabled: !selectedRole,
            }}
            backButtonProps={{
              disabled: true,
            }}
          />
        </div>
      </div>
    </AuthContentContainer>
  );
}

export default RegisterPage;
