/**
 * Maps UI filter state to API query parameters
 * 
 * IMPORTANT: These filters are applied to the SERVICES within each doctor.
 * A doctor will be returned if they have at least ONE service matching all the filters.
 * 
 * Handles the transformation between frontend filter format and backend API expectations
 */

export interface SearchProviderFilters {
  name: string;
  insuranceAccepted: string[];
  providerType: string[];
  modality: string[];
  specialty: string[];
  gender: string[];
  yearsOfExperience: number | null;
  languages: string[];
  scheduledAppointments: string[];
  rating: number | null;
}

export interface APISearchParams {
  especialidadId?: number;
  especialidadIds?: number[];
  modalidad?: string;
  calificacionMin?: number;
  anosExperienciaMinima?: number;
  genero?: string;
  idioma?: string;
  estado?: string;
  // Translation params
  target?: string;
  source?: string;
  translate_fields?: string;
}

/**
 * Maps UI filters to API query parameters
 * 
 * These parameters filter the services within each doctor.
 * Doctors are returned if they have at least one service matching all criteria.
 * 
 * @param filters - UI filter state
 * @param language - Current language for translations (e.g., 'es', 'en')
 * @param especialidadesOptions - Specialty options with IDs for mapping
 * @returns API query parameters object
 */
export const mapFiltersToAPIParams = (
  filters: SearchProviderFilters,
  language: string = "es",
  especialidadesOptions: Array<{ value: string; label: string }> = []
): APISearchParams => {
  const params: APISearchParams = {
    estado: "Activo", // Only active services
  };

  // Add translation parameters
  params.target = language || "es";
  params.source = language === "es" ? "en" : "es";
  params.translate_fields = "nombre,descripcion,modalidad";

  console.log("Mapping filters to API params:", filters);

  // Map specialty filter
  if (
    filters.specialty?.length > 0 &&
    !filters.specialty.includes("all")
  ) {
    // Convert specialty names to IDs
    const especialidadIds = filters.specialty
      .map((specialtyLabel) => {
        const option = especialidadesOptions.find(
          (opt) => opt.label === specialtyLabel || opt.value === specialtyLabel
        );
        return option ? parseInt(option.value) : null;
      })
      .filter((id): id is number => id !== null);

    if (especialidadIds.length > 0) {
      if (especialidadIds.length === 1) {
        params.especialidadId = especialidadIds[0];
      } else {
        params.especialidadIds = especialidadIds;
      }
    }
  }

  // Map modality filter
  if (
    filters.modality?.length > 0 &&
    !filters.modality.includes("all")
  ) {
    // If multiple modalities selected, prefer "Mixta"
    if (filters.modality.length > 1) {
      params.modalidad = "Mixta";
    } else {
      const modalityMap: Record<string, string> = {
        presencial: "Presencial",
        Presencial: "Presencial",
        teleconsulta: "Teleconsulta",
        Virtual: "Teleconsulta",
        virtual: "Teleconsulta",
        Mixta: "Mixta",
        hibrido: "Mixta",
      };
      params.modalidad = modalityMap[filters.modality[0]] || filters.modality[0];
    }
  }

  // Map rating filter
  if (
    filters.rating !== null &&
    filters.rating !== undefined
  ) {
    // Convert rating to minimum value
    const ratingValue = Array.isArray(filters.rating)
      ? parseFloat(filters.rating[0])
      : parseFloat(String(filters.rating));
    
    if (!isNaN(ratingValue) && ratingValue > 0) {
      params.calificacionMin = ratingValue;
    }
  }

  
  // Map years of experience filter
  if (
    filters.yearsOfExperience !== null &&
    filters.yearsOfExperience !== undefined &&
    filters.yearsOfExperience > 0
  ) {
    params.anosExperienciaMinima = filters.yearsOfExperience;
  }

  // Map gender filter
  if (
    filters.gender?.length > 0 &&
    !filters.gender.includes("all")
  ) {
    // For now, only support single gender selection
    // API might need to be enhanced to support multiple genders
    params.genero = filters.gender[0];
  }

  // Note: The following filters are not supported by the API yet
  // They will be applied client-side in the hook:
  // - insuranceAccepted
  // - languages
  // - scheduledAppointments
  // - name (text search)
  console.warn("filters mapped:", params);

  return params;
};

/**
 * Checks if filters require client-side filtering
 * Returns true if any filter is set that the API doesn't support
 */
export const hasClientSideFilters = (filters: SearchProviderFilters): boolean => {
  return (
    (filters.name && filters.name.length > 0) ||
    (filters.insuranceAccepted?.length > 0 && !filters.insuranceAccepted.includes("all")) ||
    (filters.languages?.length > 0 && !filters.languages.includes("all")) ||
    (filters.scheduledAppointments?.length > 0 && !filters.scheduledAppointments.includes("all"))
  );
};

/**
 * Creates a cache key for React Query based on filters
 */
export const createFilterCacheKey = (
  lat: number | null,
  lng: number | null,
  radiusKm: number,
  filters: SearchProviderFilters,
  language: string
): unknown[] => {
  return [
    "doctors",
    "search",
    lat,
    lng,
    radiusKm,
    language,
    filters.specialty,
    filters.modality,
    filters.rating,
    filters.yearsOfExperience,
    filters.gender,
  ];
};
