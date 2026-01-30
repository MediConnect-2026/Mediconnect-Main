import React, { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import MCButton from "@/shared/components/forms/MCButton";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import MCSheetProfile from "@/shared/navigation/userMenu/editProfile/MCSheetProfile";
import { useTranslation } from "react-i18next";

const insurances = [
  {
    name: "Humano Seguros",
    logo: "https://s3.amazonaws.com/evaluar-test-media-bucket/COMPANY/image/67/COMPANY_7a476ee4-4673-4bb2-a29a-12c32e08a867_775c0b8b-1322-4cdc-8e6d-25878175795d.jpeg",
  },
  {
    name: "ARS Universal",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrDTX2UWf9hhw5q1UWmhInqqpz6kQKtf0l2Q&s",
  },
  {
    name: "ARS Yunen",
    logo: "https://megacentro.com.do/content/uploads/2022/08/Logo-Yunen-512x512-1.png",
  },
  {
    name: "ARS Yunen",
    logo: "https://megacentro.com.do/content/uploads/2022/08/Logo-Yunen-512x512-1.png",
  },
  {
    name: "ARS Yunen",
    logo: "https://megacentro.com.do/content/uploads/2022/08/Logo-Yunen-512x512-1.png",
  },
  {
    name: "ARS Yunen",
    logo: "https://megacentro.com.do/content/uploads/2022/08/Logo-Yunen-512x512-1.png",
  },
];

function MyInsurance() {
  const [openSheet, setOpenSheet] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useTranslation("patient");

  // Ajusta el número de items para activar el scroll según el tamaño de pantalla
  const scrollLimit = isMobile ? 3 : 5; // Puedes ajustar estos valores
  const scrollable = insurances.length > scrollLimit;

  return (
    <motion.div
      {...fadeInUp}
      className="w-full h-full flex flex-col p-2 lg:p-6"
    >
      <h2
        className={`mb-6 ${
          isMobile ? "text-lg" : "text-3xl"
        } font-semibold text-foreground`}
      >
        {t("insurance.title")}
      </h2>
      <div
        className={`space-y-6 mb-8 flex-1 ${
          scrollable ? "overflow-y-auto" : ""
        }`}
        style={scrollable ? { maxHeight: "22rem" } : {}}
      >
        {insurances.map((insurance) => (
          <div
            key={insurance.name}
            className="flex items-center gap-4 border-b border-b-primary/10 last:border-b-0 pb-6 last:pb-0"
          >
            <img
              src={insurance.logo}
              alt={insurance.name}
              className="h-16 w-20 object-contain rounded-lg bg-white border border-primary/10 p-2"
            />
            <span className="text-xl text-foreground">{insurance.name}</span>
          </div>
        ))}
      </div>
      <MCButton
        className="w-full rounded-full text-lg bg-primary text-background mt-auto"
        onClick={() => setOpenSheet(true)}
      >
        {t("insurance.add")}
      </MCButton>
      <MCSheetProfile
        open={openSheet}
        onOpenChange={setOpenSheet}
        whatTab="insurance"
      />
    </motion.div>
  );
}

export default MyInsurance;
