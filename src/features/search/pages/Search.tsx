import React, { useState, useMemo } from "react";
import DoctorSearchBar from "@/features/patient/components/DoctorSearchBar";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import { DoctorCards } from "../components/DoctorCards";
import { CenterCards } from "../components/CenterCards";
import {
  allProviders,
  type Provider,
  type Doctor,
  type Clinic,
} from "@/data/providers";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/shared/ui/empty";
import MapSearchProviders from "@/shared/components/maps/MapSearchProviders";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "react-i18next";
import { fadeInUp, fadeInUpDelayed } from "@/lib/animations/commonAnimations";
import { motion } from "framer-motion";
import MCButton from "@/shared/components/forms/MCButton";
import CompareModal from "../components/CompareModal";
const tipoProveedorOptions = [
  { value: "all", label: "Todos" },
  { value: "doctor", label: "Doctor" },
  { value: "hospital", label: "Hospital" },
  { value: "clinica", label: "Clínica" },
];

const calificacionOptions = [
  { value: "all", label: "Todos" },
  { value: "5", label: "5 estrellas" },
  { value: "4", label: "4 estrellas o más" },
  { value: "3", label: "3 estrellas o más" },
];

const especialidadOptions = [
  { value: "all", label: "Todos" },
  { value: "cardiologia", label: "Cardiología" },
  { value: "pediatria", label: "Pediatría" },
  { value: "dermatologia", label: "Dermatología" },
  // Agrega más especialidades según sea necesario
];

const modalidadOptions = [
  { value: "all", label: "Todos" },
  { value: "presencial", label: "Presencial" },
  { value: "virtual", label: "Virtual" },
];

const generoOptions = [
  { value: "all", label: "Todos" },
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
  { value: "otro", label: "Otro" },
];

const idiomasOptions = [
  { value: "all", label: "Todos" },
  { value: "espanol", label: "Español" },
  { value: "ingles", label: "Inglés" },
  { value: "frances", label: "Francés" },
  // Agrega más idiomas según sea necesario
];

const horarioOptions = [
  { value: "all", label: "Todos" },
  { value: "manana", label: "Mañana" },
  { value: "tarde", label: "Tarde" },
  { value: "noche", label: "Noche" },
];

function Search() {
  const { t } = useTranslation("common");

  // Estados para filtros y selección
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [connectedClinics, setConnectedClinics] = useState<string[]>([]);
  const [filteredProviders, setFilteredProviders] =
    useState<Provider[]>(allProviders);

  // Handlers de ejemplo (ajusta según tu lógica real)
  const handleProviderSelect = (id: string) => {
    setSelectedProviders((prev) =>
      prev.includes(id)
        ? prev.filter((pid) => pid !== id)
        : prev.length < 3
          ? [...prev, id]
          : prev,
    );
  };

  const handleClinicConnect = (id: string) => {
    setConnectedClinics((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id],
    );
  };

  const handleViewProfile = (id: string) => {
    // Lógica para ver perfil
    console.log("Ver perfil de:", id);
  };

  return (
    <div className="min-h-screen px-4 py-8 flex flex-col items-center bg-background rouneded-2xl md:rounded-4xl shadow-sm ">
      {/* Barra de búsqueda */}
      <motion.div
        {...fadeInUp}
        className="space-y-2  min-w-full rounded-2xl md:rounded-4xl p-6 md:p-12 flex flex-col items-center gap-2"
      >
        <div className="w-full ">
          <DoctorSearchBar />
        </div>
        <div className="w-full flex max-w-5xl gap-2 justify-center">
          <MCFilterSelect
            name="tipoProveedor"
            placeholder={t("search.providerType", "Tipo de proveedor")}
            options={tipoProveedorOptions}
            multiple
            noBadges
          />
          <MCFilterSelect
            name="especialidad"
            placeholder={t("search.specialty", "Especialidad")}
            options={especialidadOptions}
            multiple
            noBadges
          />
          <MCFilterSelect
            name="modalidad"
            placeholder={t("search.modality", "Modalidad")}
            options={modalidadOptions}
            multiple
            noBadges
          />
          <MCFilterSelect
            name="genero"
            placeholder={t("search.gender", "Género")}
            options={generoOptions}
            multiple
            noBadges
          />
          <MCFilterSelect
            name="idiomas"
            placeholder={t("search.languages", "Idiomas")}
            options={idiomasOptions}
            multiple
            noBadges
          />
          <MCFilterSelect
            name="horario"
            placeholder={t("search.schedule", "Horario")}
            options={horarioOptions}
            multiple
            noBadges
          />
          <MCFilterSelect
            name="calificacion"
            placeholder={t("search.rating", "Calificación")}
            options={calificacionOptions}
            multiple
            noBadges
          />
        </div>
      </motion.div>

      {/* Contador de seleccionados */}
      {selectedProviders.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 w-full z-50  bg-background dark:bg-bg-btn-secondary shadow-lg border border-primary/15  border-b-transparent flex items-center justify-between px-4 py-2.5 md:max-w-md md:left-1/2 md:-translate-x-1/2 rounded-t-2xl"
          style={{ maxWidth: 480 }}
        >
          <span className="text-sm  text-primary">
            {t("search.selectedProviders", {
              count: selectedProviders.length,
              max: 3,
              defaultValue: "{{count}} de {{max}} seleccionados para comparar",
            })}
          </span>
          <CompareModal
            selectedProviders={allProviders.filter((provider) =>
              selectedProviders.includes(provider.id),
            )}
          >
            <MCButton
              className="w-fit
              "
              size="sm"
              onClick={() => console.log("Comparar:", selectedProviders)}
            >
              {t("search.compare", "Comparar")}
            </MCButton>{" "}
          </CompareModal>
        </motion.div>
      )}

      {/* Contenido principal */}
      <main className="p-4 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[4fr_6fr] gap-4 h-[calc(100vh-200px)]">
          {/* Lista de proveedores - Izquierda */}
          <motion.div
            {...fadeInUp}
            className="space-y-4 overflow-y-auto"
            style={{
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE 10+
            }}
          >
            <style>
              {`
                /* Chrome, Edge, Safari */
                .space-y-4::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium opacity-70">
                {t("search.providersFound", {
                  count: filteredProviders.length,
                  defaultValue: "{{count}} providers found",
                })}
              </h2>
            </div>

            <div className="space-y-4">
              {filteredProviders.length === 0 ? (
                <Empty>
                  <EmptyContent>
                    <EmptyTitle>
                      {t("search.noProvidersFound", "No providers found")}
                    </EmptyTitle>
                    <EmptyDescription>
                      {t(
                        "search.noResultsDescription",
                        "No results for the selected filters. Try changing the filters or search.",
                      )}
                    </EmptyDescription>
                  </EmptyContent>
                </Empty>
              ) : (
                filteredProviders.map((provider) => {
                  if (provider.type === "doctor") {
                    return (
                      <DoctorCards
                        key={provider.id}
                        doctor={provider as Doctor}
                        isSelected={selectedProviders.includes(provider.id)}
                        onSelect={handleProviderSelect}
                        onViewProfile={handleViewProfile}
                      />
                    );
                  } else {
                    return (
                      <CenterCards
                        key={provider.id}
                        clinic={provider as Clinic}
                        isConnected={connectedClinics.includes(provider.id)}
                        onConnect={handleClinicConnect}
                        onViewProfile={handleViewProfile}
                      />
                    );
                  }
                })
              )}
            </div>
          </motion.div>

          {/* Mapa - Derecha */}
          <motion.div
            {...fadeInUp}
            className="bg-card rounded-xl border border-border h-full"
          >
            <div className="h-full">
              <MapSearchProviders
                providers={filteredProviders}
                selectedProviders={selectedProviders}
                onProviderSelect={handleProviderSelect}
              />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default Search;
