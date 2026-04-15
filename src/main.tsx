import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import "./index.css";
import App from "./App.tsx";
import "@/i18n/config";
import MCToast from "@/shared/components/MCToast";
import "mapbox-gl/dist/mapbox-gl.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <MCToast />
    <Analytics />
  </StrictMode>,
);
