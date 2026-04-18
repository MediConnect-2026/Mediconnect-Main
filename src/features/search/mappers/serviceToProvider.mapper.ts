import type {
  DoctorNearby,
  CenterNearby,
} from "@/shared/navigation/userMenu/editProfile/doctor/services/doctor.types";
import type { Doctor, Provider } from "@/data/providers";
import { doctorService } from "@/shared/navigation/userMenu/editProfile/doctor/services";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import i18n from "@/i18n/config";

const resolveLocale = (language: string): string =>
  language?.toLowerCase().startsWith("en") ? "en-US" : "es-ES";

const tByLang = (language: string, key: string, fallback: string): string =>
  i18n.t(key, {
    ns: "common",
    lng: language,
    defaultValue: fallback,
  }) as string;

/**
 * Maps API doctor data (with nested services) to UI Provider format
 * Each doctor from the API is transformed into one Provider entry
 *
 * @param doctors - Array of doctors from the API (getDoctoresByDistance)
 * @returns Array of Provider objects (Doctor type) for the UI
 */
export const mapDoctorsToProviders = async (
  doctors: DoctorNearby[],
  language: string = useGlobalUIStore.getState().language ||
    i18n.language ||
    "es",
  // When true, avoid fetching availability slots for each doctor (e.g., center users)
  skipAvailability: boolean = false,
): Promise<Provider[]> => {
  if (!doctors || doctors.length === 0) {
    return [];
  }

  const providers: Doctor[] = await Promise.all(
    doctors.map(async (doctor) => {
      const noSpecialtyLabel = tByLang(
        language,
        "search.fallbacks.noSpecialty",
        "Sin especialidad",
      );
      const noAddressLabel = tByLang(
        language,
        "search.fallbacks.noAddress",
        "Sin dirección",
      );

      // Extract primary specialty
      const primarySpecialty = doctor.especialidades.find(
        (e) => e.es_principal,
      );
      const mainSpecialtyName =
        primarySpecialty?.especialidades.nombre || noSpecialtyLabel;

      // Extract all specialty names
      const specialties = doctor.especialidades.map(
        (e) => e.especialidades.nombre,
      );

      // Extract modality from services
      const modalitySet = new Set<"Presencial" | "Virtual">();
      doctor.servicios.forEach((s) => {
        const modality = mapModalityToUI(s.modalidad);
        modality.forEach((m) => modalitySet.add(m));
      });
      const modality = Array.from(modalitySet);

      // Extract unique addresses from ubicaciones
      const addresses = doctor.servicios
        .map((u) =>
          u.servicios_ubicaciones.map((su) => {
            return su.ubicacion.direccion;
          }),
        )
        .flat();

      // Extract insurance names
      const insurances = Array.from(
        new Set(doctor.segurosAceptados.map((s) => s.seguro.nombre)),
      );

      // Try to fetch availability for the doctor unless skipping is requested
      let availability = generateAvailabilityPlaceholder(language);
      if (!skipAvailability) {
        try {
          const slotsResp = await doctorService.getDoctorSlotsAvailableInRange(
            doctor.usuarioId,
            new Date().toISOString().split("T")[0], // startDate: today
            5,
            {
              target: language || "es",
              source: language === "es" ? "en" : "es",
              translate_fields: "diaSemana,mes",
            },
          );

          if (slotsResp?.data && Array.isArray(slotsResp.data)) {
            availability = slotsResp.data.map((slot: any) => {
              const dayOfMonth = slot.fecha.split("-")[2];
              return {
                date: dayOfMonth,
                dayName: slot.diaSemana,
                slots: slot.totalSlotsLibres,
                month: slot.mes,
              };
            });
          }
        } catch (e) {
          // Keep placeholder on error
          console.error(
            `Failed to fetch availability for doctor ID ${doctor.usuarioId}`,
            e,
          );
        }
      }

      // Default coordinates (TODO: extract from ubicaciones if available)
      const coordinates = doctor.servicios
        .map((u) =>
          u.servicios_ubicaciones.map((su) => {
            return { lat: su.ubicacion.latitud, lng: su.ubicacion.longitud };
          }),
        )
        .flat();

      //Map languages
      const languages = doctor.idiomas.map((i) => i.nombre);

      return {
        id: doctor.usuarioId.toString(),
        type: "doctor",
        name: `${doctor.nombre} ${doctor.apellido}`,
        specialty: mainSpecialtyName,
        rating: Math.round(doctor.calificacionPromedio * 10) / 10,
        reviewCount: doctor.cantidadResenas,
        address: addresses.length > 0 ? addresses : [noAddressLabel],
        languages: languages,
        insurances,
        phone: doctor.usuario.telefono || "",
        image: doctor.usuario.fotoPerfil || "",
        coordinates,
        modality,
        experience: doctor.anosExperiencia,
        specialties,
        bio: doctor.biografia || "",
        availability,
        connectionStatus: "not_connected",
        isFavorite: doctor.esFavorito,
        // Store additional data for filtering
        _rawDoctor: doctor, // Keep reference to raw doctor data for filtering
      } as Doctor & { _rawDoctor: DoctorNearby };
    }),
  );

  return providers;
};

/**
 * Maps center (clinic) API objects to UI Provider format (Clinic)
 * Keeps a reference to the original center in `_rawCenter` for client-side filters
 */
export const mapCentersToProviders = (
  centers: CenterNearby[] = [],
  language: string = useGlobalUIStore.getState().language ||
    i18n.language ||
    "es",
): Provider[] => {
  if (!centers || centers.length === 0) return [];

  const providers: Provider[] = centers.map((c) => {
    const noAddressLabel = tByLang(
      language,
      "search.fallbacks.noAddress",
      "Sin dirección",
    );
    const healthCenterLabel = tByLang(
      language,
      "search.fallbacks.healthCenter",
      "Centro de salud",
    );

    const normalizedAllianceStatus = (c.estadoAlianza || "").toLowerCase();
    const isConnected =
      c.estaConectado === true ||
      normalizedAllianceStatus === "aceptada" ||
      normalizedAllianceStatus === "accepted";
    const isPending =
      normalizedAllianceStatus === "pendiente" ||
      normalizedAllianceStatus === "pending" ||
      normalizedAllianceStatus === "en_proceso" ||
      normalizedAllianceStatus === "in_progress";

    const name = c.nombreComercial || c.tipoCentro?.nombre || healthCenterLabel;

    const address = c.ubicacion?.direccionCompleta
      ? [c.ubicacion.direccionCompleta]
      : c.ubicacion?.direccion
        ? [c.ubicacion.direccion]
        : c.ubicacion?.provincia
          ? [c.ubicacion.provincia]
          : [noAddressLabel];

    const coordinates =
      c.ubicacion &&
      typeof c.ubicacion.latitud === "number" &&
      typeof c.ubicacion.longitud === "number"
        ? { lat: c.ubicacion.latitud, lng: c.ubicacion.longitud }
        : ([] as any);

    const languages = Array.from(
      new Set(
        (c.idiomas || []).map((i) => i.nombre).filter(Boolean) as string[],
      ),
    );

    const insurances = Array.from(
      new Set(
        (c.seguros || []).map((s) => s.nombre).filter(Boolean) as string[],
      ),
    );

    const connectionStatus: "connected" | "not_connected" | "pending" =
      isConnected ? "connected" : isPending ? "pending" : "not_connected";

    return {
      id: c.usuarioId.toString(),
      type: "clinic",
      name,
      rating: 0,
      reviewCount: 0,
      address,
      languages,
      insurances,
      phone: c.usuario?.telefono || c.telefono || "",
      image: c.usuario?.fotoPerfil || c.foto_perfil || "",
      coordinates,
      modality: ["Presencial"],
      specialties: c.tipoCentro?.nombre ? [c.tipoCentro.nombre] : [],
      connectionStatus,
      // Attach raw center for filtering
      // @ts-ignore - extra prop used for client-side filtering
      _rawCenter: c,
    } as Provider;
  });

  return providers;
};

/**
 * Maps API modality string to UI modality array
 */
const mapModalityToUI = (modalidad: string): ("Presencial" | "Virtual")[] => {
  const normalized = modalidad.toLowerCase();

  if (normalized.includes("mixed") || normalized.includes("mixta")) {
    return ["Presencial", "Virtual"];
  }
  if (normalized.includes("virtual") || normalized.includes("teleconsulta")) {
    return ["Virtual"];
  }
  if (normalized.includes("present") || normalized.includes("presencial")) {
    return ["Presencial"];
  }

  // Default to presencial if unknown
  return ["Presencial"];
};

/**
 * Generates placeholder availability data
 * TODO: Process actual horarios from service data
 */
const generateAvailabilityPlaceholder = (language: string = "es") => {
  const locale = resolveLocale(language);
  const today = new Date();
  const weekdayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
  });

  return Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    const dayNameRaw = weekdayFormatter.format(date).replace(".", "");
    const dayName = dayNameRaw.charAt(0).toUpperCase() + dayNameRaw.slice(1);

    return {
      date: date.toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
      }),
      dayName,
      slots: Math.floor(Math.random() * 15), // Placeholder
    };
  });
};
