import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import authen from "@/i18n/locales/en/auth.json";
import authes from "@/i18n/locales/es/auth.json";
import patienten from "@/i18n/locales/en/patient.json";
import patientes from "@/i18n/locales/es/patient.json";
import doctoren from "@/i18n/locales/en/doctor.json";
import doctores from "@/i18n/locales/es/doctor.json";
import centeren from "@/i18n/locales/en/center.json";
import centeres from "@/i18n/locales/es/center.json";
import commonen from "@/i18n/locales/en/common.json";
import comunes from "@/i18n/locales/es/common.json";
import landen from "@/i18n/locales/en/landing.json"; // <-- Importa landing en inglés
// Si tienes landing.json en español, impórtalo también:
import landes from "@/i18n/locales/es/landing.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    ns: ["auth", "patient", "doctor", "center", "common", "landing"], // <-- Agrega "landing"
    defaultNS: "auth",
    resources: {
      en: {
        auth: authen,
        patient: patienten,
        doctor: doctoren,
        center: centeren,
        common: commonen,
        landing: landen, // <-- Agrega landing
      },
      es: {
        auth: authes,
        patient: patientes,
        doctor: doctores,
        center: centeres,
        common: comunes,
        landing: landes, // <-- Descomenta si tienes landing.json en español
      },
    },
  });

export default i18n;
