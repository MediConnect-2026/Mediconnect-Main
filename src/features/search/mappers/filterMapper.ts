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
  modality: string;
  specialty: string[];
  gender: string;
  yearsOfExperience: number | null;
  languages: string;
  scheduledAppointments: string;
  rating: number | null;
  radio: number | null;
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
  tipoCentroId?: number;
  tipoCentroIds?: number[];
  turno?: string;
  radio?: number;
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
 * @param providerOptions - Provider type options with IDs for mapping
 * @returns API query parameters object
 */
export const mapFiltersToAPIParams = (
  filters: SearchProviderFilters,
  language: string,
  especialidadesOptions: Array<{ value: string; label: string }> = [],
  providerOptions: Array<{ value: string; label: string }> = []
): APISearchParams => {
  const params: APISearchParams = {
    estado: "Activo", // Only active services
  };

  // Add translation parameters
  params.target = language === "en" ? "en" : "es";
  params.source = language === "en" ? "es" : "en";
  params.translate_fields = "nombre,descripcion,modalidad";


  //Map provider type filter
  if (
    filters.providerType &&
    filters.providerType.length > 0 &&
    !filters.providerType.includes("all")
  ) {
    const providerTypeIds = filters.providerType
      .map((type) => {
        const option = providerOptions.find((opt) => opt.label === type || opt.value === type);
        return option ? parseInt(option.value) : null;
      })
      .filter((id): id is number => id !== null);
    if (providerTypeIds.length > 0) {
      // Assuming multiple provider types is supported by the API
      if (providerTypeIds.length === 1) {
        params.tipoCentroId = providerTypeIds[0];
      } else {
        params.tipoCentroIds = providerTypeIds;
      }
    }
  }

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
    filters.modality &&
    filters.modality !== "all"
  ) {
    const modalityMap: Record<string, string> = {
      presencial: "Presencial",
      Presencial: "Presencial",
      teleconsulta: "Teleconsulta",
      Virtual: "Teleconsulta",
      virtual: "Teleconsulta",
      Mixta: "Mixta",
      hibrido: "Mixta",
    };
    params.modalidad = modalityMap[filters.modality] || filters.modality;
  }

  // Map gender filter
  if (
    filters.gender &&
    filters.gender !== "all"
  ) {
    params.genero = filters.gender;
  }

  //map languages filter  
  if (
    filters.languages &&
    filters.languages !== "all"
  ) {
    params.idioma = filters.languages.toLowerCase();
  }

  // Map scheduled appointments filter to turno
  if (
    filters.scheduledAppointments &&
    filters.scheduledAppointments !== "all"
  ) {
    params.turno = filters.scheduledAppointments.toLowerCase();
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

  // Map radio filter
  // Map radio filter: only include when it's a positive finite number.
  // If the UI sends "all" (mapped to null) or any invalid value, omit the param
  // so the backend performs a general search.
  if (typeof filters.radio === "number" && Number.isFinite(filters.radio) && filters.radio > 0) {
    params.radio = filters.radio;
  }


  // Note: The following filters are applied client-side only:
  // - insuranceAccepted (not available in API)
  // - name (text search, not available in API)
  console.warn("filters mapped:", params);

  return params;
};

/**
 * Checks if filters require client-side filtering
 * Returns true if any filter is set that the API doesn't support
 */
export const hasClientSideFilters = (filters: SearchProviderFilters): boolean => {
  return (
    (!!filters.name && filters.name.length > 0) ||
    (!!filters.insuranceAccepted && filters.insuranceAccepted.length > 0 && !filters.insuranceAccepted.includes("all")) ||
    (!!filters.languages && filters.languages !== "all") ||
    (!!filters.scheduledAppointments && filters.scheduledAppointments !== "all")
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
    filters.providerType,
    filters.specialty,
    filters.modality,
    filters.rating,
    filters.yearsOfExperience,
    filters.gender,
    filters.languages,
    filters.scheduledAppointments,
    filters.radio,
  ];
};
