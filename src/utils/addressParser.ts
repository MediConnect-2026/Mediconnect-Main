export interface ParsedDominicanAddress {
  direccion: string;
  municipio: string;
  provincia: string;
}

export async function ParseDominicanAddress(
  lat: number,
  lng: number,
): Promise<ParsedDominicanAddress> {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=es&country=DO`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.features || data.features.length === 0) {
      return { direccion: "", municipio: "", provincia: "" };
    }

    // Buscar los componentes relevantes
    let direccion = "";
    let municipio = "";
    let provincia = "";

    for (const feature of data.features) {
      if (feature.place_type.includes("address") && !direccion) {
        direccion = feature.text;
      }
      if (feature.place_type.includes("place") && !municipio) {
        municipio = feature.text;
      }
      if (feature.place_type.includes("region") && !provincia) {
        provincia = feature.text;
      }
    }

    // Si no hay address, usar el primero como dirección
    if (!direccion && data.features[0]) {
      direccion = data.features[0].text;
    }

    return { direccion, municipio, provincia };
  } catch {
    return { direccion: "", municipio: "", provincia: "" };
  }
}

/**
 * Formatea una dirección completa desde un objeto ServiceDetailUbicacion o un arreglo de ubicaciones
 * @param ubicacion - Objeto con los datos de ubicación, arreglo de ubicaciones, o any
 * @returns String con la dirección completa formateada. Si es un arreglo, devuelve todas las direcciones separadas por " | "
 */
export function getAddressComplete(ubicacion: any): string {
  if (!ubicacion) return "";

  // Si es un arreglo, procesar cada ubicación y unirlas
  if (Array.isArray(ubicacion)) {
    const addresses = ubicacion
      .map((ub) => formatSingleAddress(ub))
      .filter(Boolean);
    return addresses.join(" | ");
  }

  // Si es un solo objeto, procesarlo directamente
  return formatSingleAddress(ubicacion);
}

/**
 * Formatea una única ubicación
 * @param ubicacion - Objeto con los datos de ubicación
 * @returns String con la dirección formateada
 */
function formatSingleAddress(ubicacion: any): string {
  if (!ubicacion) return "";

  const parts: string[] = [];

  // Nombre del lugar/ubicación
  if (ubicacion.nombre && ubicacion.nombre !== ubicacion.direccion) {
    parts.push(ubicacion.nombre);
  }

  // Dirección específica
  if (ubicacion.direccion) {
    parts.push(ubicacion.direccion);
  }

  // Barrio
  if (ubicacion.barrio?.nombre) {
    parts.push(ubicacion.barrio.nombre);
  }

  // Sección
  if (ubicacion.barrio?.seccion?.nombre) {
    parts.push(ubicacion.barrio.seccion.nombre);
  }

  // Municipio
  if (ubicacion.barrio?.seccion?.municipio?.nombre) {
    parts.push(ubicacion.barrio.seccion.municipio.nombre);
  }

  // Provincia
  if (ubicacion.barrio?.seccion?.municipio?.provincia?.nombre) {
    parts.push(ubicacion.barrio.seccion.municipio.provincia.nombre);
  }

  // Código postal
  if (ubicacion.codigoPostal) {
    parts.push(ubicacion.codigoPostal);
  }

  // República Dominicana (opcional, descomentar si se desea)
  // parts.push("República Dominicana");

  return parts.filter(Boolean).join(", ");
}
