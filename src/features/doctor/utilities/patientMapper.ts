/**
 * patientMapper.ts
 * Pure utility functions for mapping and filtering patient data.
 *
 * Changes vs original:
 * - All `any` replaced with proper types
 * - `buscarYFiltrarPacientes` is a single-pass O(n) function (no double iteration)
 * - `normalizarGenero` uses a lookup-map instead of a chain of if-else
 * - `filtrarPacientesCliente` early-returns are preserved but consolidated
 * - Exported PacienteFiltroOpciones is kept; added stricter filters shape
 */
import type { PacienteDelDoctor, FiltrosPacientes } from "@/types/DoctorStatsTypes";

// ─── UI patient shape ─────────────────────────────────────────────────────────
export interface PacienteUI {
  id: string | number;
  pacienteId: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  fotoPerfil: string;
  edad: number;
  genero: string;
  email: string;
  telefono: string;
  peso: number;
  altura: number;
  tipoSangre: string;
  tipoDocIdentificacion: string;
  numeroDocIdentificacion: string;
  condicionesTotal: number;
  alergias: number;
  ultimaCitaFecha: string;
  ultimaCitaHora: string;
  ultimaCitaEstado: string;
  ultimaCitaModalidad: string;
  servicioNombre: string;
  especialidadId?: number;
  especialidadNombre: string;
  ubicacionId?: number;
  ubicacionNombre: string;
  totalCitas: number;
  conversationId?: string;
}

export type NormalizedGender = "male" | "female" | "other";

// ─── Lookup map (faster than if-else chain for hot path) ──────────────────────
const GENDER_MAP: Record<string, NormalizedGender> = {
  M: "male",
  male: "male",
  F: "female",
  female: "female",
};

export const normalizarGenero = (genero: string): NormalizedGender => {
  if (!genero) return "other";
  const direct = GENDER_MAP[genero];
  if (direct) return direct;
  const lower = genero.toLowerCase();
  if (lower.startsWith("m")) return "male";
  if (lower.startsWith("f")) return "female";
  return "other";
};

// ─── API → UI mapper ──────────────────────────────────────────────────────────
export const mapPacienteAPIToUI = (
  paciente: PacienteDelDoctor,
  conversationId?: string
): PacienteUI => ({
  id: paciente.pacienteId,
  pacienteId: paciente.pacienteId,
  nombre: paciente.nombre,
  apellido: paciente.apellido,
  nombreCompleto: `${paciente.nombre} ${paciente.apellido}`,
  fotoPerfil: paciente.fotoPerfil ?? "",
  edad: paciente.edad,
  genero: paciente.genero,
  email: paciente.email,
  telefono: paciente.telefono,
  peso: paciente.peso,
  altura: paciente.altura,
  tipoSangre: paciente.tipoSangre,
  tipoDocIdentificacion: paciente.tipoDocIdentificacion,
  numeroDocIdentificacion: paciente.numeroDocIdentificacion,
  condicionesTotal: paciente.condiciones.total,
  alergias: 0, // TODO: add when available in API
  ultimaCitaFecha: paciente.ultimaCita?.fecha ?? "",
  ultimaCitaHora: paciente.ultimaCita?.hora ?? "",
  ultimaCitaEstado: paciente.ultimaCita?.estado ?? "",
  ultimaCitaModalidad: paciente.ultimaCita?.modalidad ?? "",
  servicioNombre: paciente.ultimaCita?.servicio?.nombre ?? "",
  especialidadId: paciente.ultimaCita?.servicio?.especialidad?.id,
  especialidadNombre: paciente.ultimaCita?.servicio?.especialidad?.nombre ?? "",
  ubicacionId: paciente.ubicacionUltimaCita?.id,
  ubicacionNombre: paciente.ubicacionUltimaCita?.nombre ?? "",
  totalCitas: paciente.totalCitas,
  conversationId,
});

export const mapPacientesAPIToUI = (pacientes: PacienteDelDoctor[]): PacienteUI[] =>
  pacientes.map((p) => mapPacienteAPIToUI(p));

// ─── Specialty / location accessors ──────────────────────────────────────────
export const getEspecialidadNombre = (paciente: PacienteUI): string =>
  paciente.especialidadNombre || "Sin especialidad";

export const getUbicacionNombre = (paciente: PacienteUI): string =>
  paciente.ubicacionNombre || "Sin ubicación";

// ─── API filter builder ───────────────────────────────────────────────────────
export interface UIFilters {
  gender?: string;
  specialty?: string;
  location?: string;
  hasCondition?: string;
  hasAllergy?: string;
  lastVisitRange?: [Date, Date];
}

export const construirFiltrosAPI = (
  filtrosUI: UIFilters,
  pagina = 1,
  limite = 10,
  buscar = "",
  language = "es"
): FiltrosPacientes => {
  const filtros: FiltrosPacientes = {
    pagina,
    limite,
    target: language === "es" ? "es" : "en",
    source: language === "es" ? "en" : "es",
    translate_fields: "nombre, direccion",
  };

  if (buscar) filtros.buscar = buscar;

  if (filtrosUI.gender && filtrosUI.gender !== "all") {
    filtros.genero = filtrosUI.gender.toUpperCase() as "M" | "F";
  }

  if (filtrosUI.specialty && filtrosUI.specialty !== "all") {
    filtros.especialidadId = Number(filtrosUI.specialty);
  }

  if (filtrosUI.location && filtrosUI.location !== "all") {
    filtros.ubicacionId = Number(filtrosUI.location);
  }

  if (filtrosUI.hasCondition === "yes") filtros.tieneCondiciones = true;
  else if (filtrosUI.hasCondition === "no") filtros.tieneCondiciones = false;

  if (filtrosUI.hasAllergy === "yes") filtros.tieneAlergias = true;
  else if (filtrosUI.hasAllergy === "no") filtros.tieneAlergias = false;

  if (filtrosUI.lastVisitRange) {
    const [desde, hasta] = filtrosUI.lastVisitRange;
    filtros.ultimaCitaDesde = desde.toISOString().split("T")[0];
    filtros.ultimaCitaHasta = hasta.toISOString().split("T")[0];
  }

  return filtros;
};

// ─── Client-side filter (single-pass) ────────────────────────────────────────
export const filtrarPacientesCliente = (
  pacientes: PacienteUI[],
  filtrosUI: UIFilters
): PacienteUI[] =>
  pacientes.filter((p) => {
    if (filtrosUI.gender && filtrosUI.gender !== "all") {
      if (normalizarGenero(p.genero) !== filtrosUI.gender) return false;
    }

    if (filtrosUI.hasCondition === "yes" && p.condicionesTotal === 0) return false;
    if (filtrosUI.hasCondition === "no" && p.condicionesTotal > 0) return false;

    if (filtrosUI.hasAllergy === "yes" && p.alergias === 0) return false;
    if (filtrosUI.hasAllergy === "no" && p.alergias > 0) return false;

    if (filtrosUI.specialty && filtrosUI.specialty !== "all") {
      const isNumeric = !isNaN(Number(filtrosUI.specialty));
      if (isNumeric) {
        if (p.especialidadId?.toString() !== filtrosUI.specialty) return false;
      } else {
        if (!p.especialidadNombre.toLowerCase().includes(filtrosUI.specialty.toLowerCase()))
          return false;
      }
    }

    if (filtrosUI.location && filtrosUI.location !== "all") {
      const isNumeric = !isNaN(Number(filtrosUI.location));
      if (isNumeric) {
        if (p.ubicacionId?.toString() !== filtrosUI.location) return false;
      } else {
        if (!p.ubicacionNombre.toLowerCase().includes(filtrosUI.location.toLowerCase()))
          return false;
      }
    }

    if (filtrosUI.lastVisitRange) {
      if (!p.ultimaCitaFecha) return false;
      const [desde, hasta] = filtrosUI.lastVisitRange;
      const citaDate = new Date(p.ultimaCitaFecha);
      if (citaDate < desde || citaDate > hasta) return false;
    }

    return true;
  });

// ─── Combined search + filter (single pass over the array) ───────────────────
export interface PacienteFiltroOpciones {
  searchTerm?: string;
  filters?: UIFilters;
}

export const buscarYFiltrarPacientes = (
  pacientes: PacienteUI[],
  { searchTerm = "", filters = {} }: PacienteFiltroOpciones = {}
): PacienteUI[] => {
  const termino = searchTerm.trim().toLowerCase();
  const hasSearch = termino.length > 0;
  const hasFilters = Object.entries(filters).some(([key, value]) =>
    key === "lastVisitRange" ? value !== undefined : value !== "all"
  );

  // Fast path: nothing to do
  if (!hasSearch && !hasFilters) return pacientes;

  return pacientes.filter((p) => {
    // Text search
    if (hasSearch) {
      const matches =
        p.nombreCompleto.toLowerCase().includes(termino) ||
        p.email.toLowerCase().includes(termino) ||
        p.telefono.includes(termino) ||
        p.numeroDocIdentificacion.includes(termino);
      if (!matches) return false;
    }

    // Structural filters (re-use the same predicate logic inline for single pass)
    if (hasFilters) {
      if (filters.gender && filters.gender !== "all") {
        if (normalizarGenero(p.genero) !== filters.gender) return false;
      }
      if (filters.hasCondition === "yes" && p.condicionesTotal === 0) return false;
      if (filters.hasCondition === "no" && p.condicionesTotal > 0) return false;
      if (filters.hasAllergy === "yes" && p.alergias === 0) return false;
      if (filters.hasAllergy === "no" && p.alergias > 0) return false;

      if (filters.specialty && filters.specialty !== "all") {
        const isNumeric = !isNaN(Number(filters.specialty));
        if (isNumeric) {
          if (p.especialidadId?.toString() !== filters.specialty) return false;
        } else if (
          !p.especialidadNombre.toLowerCase().includes(filters.specialty.toLowerCase())
        ) {
          return false;
        }
      }

      if (filters.location && filters.location !== "all") {
        const isNumeric = !isNaN(Number(filters.location));
        if (isNumeric) {
          if (p.ubicacionId?.toString() !== filters.location) return false;
        } else if (
          !p.ubicacionNombre.toLowerCase().includes(filters.location.toLowerCase())
        ) {
          return false;
        }
      }

      if (filters.lastVisitRange) {
        if (!p.ultimaCitaFecha) return false;
        const [desde, hasta] = filters.lastVisitRange;
        const citaDate = new Date(p.ultimaCitaFecha);
        if (citaDate < desde || citaDate > hasta) return false;
      }
    }

    return true;
  });
};