import type { DoctorOnboardingSchemaType } from '@/types/OnbordingTypes';
import type { RegisterDoctorRequest } from './doctor-registration.types';
import { base64ToFile } from '@/utils/base64ToFile';

/**
 * Normaliza tipos MIME parciales a sus formas completas
 * @param type - Tipo MIME parcial o completo
 * @returns Tipo MIME normalizado
 */
function normalizeMimeType(type?: string): string {
  if (!type) {
    console.warn('[normalizeMimeType] Tipo vacío, usando image/jpeg por defecto');
    return 'image/jpeg';
  }
  
  const normalized = type.toLowerCase().trim();
  
  // Si ya es un tipo MIME completo, retornarlo
  if (normalized.includes('/')) {
    console.log(`[normalizeMimeType] Tipo completo: ${normalized}`);
    return normalized;
  }
  
  // Mapear tipos parciales a tipos completos
  const partialToFull: Record<string, string> = {
    'pdf': 'application/pdf',
    'image': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  
  const fullType = partialToFull[normalized] || 'image/jpeg';
  console.log(`[normalizeMimeType] '${type}' -> '${fullType}'`);
  return fullType;
}

/**
 * Extrae la extensión de archivo correcta del tipo MIME
 * @param mimeType - Tipo MIME del archivo
 * @returns Extensión del archivo con el punto (ej: '.jpg', '.pdf')
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  };

  const normalized = mimeType.toLowerCase().trim();
  const extension = mimeToExt[normalized];
  
  if (extension) {
    console.log(`[getExtensionFromMimeType] ${normalized} -> ${extension}`);
    return extension;
  }
  
  // Si no se encuentra, intentar extraer del tipo MIME
  if (normalized.includes('pdf')) {
    console.log(`[getExtensionFromMimeType] Detectado PDF en '${normalized}' -> .pdf`);
    return '.pdf';
  }
  if (normalized.includes('image')) {
    console.log(`[getExtensionFromMimeType] Detectado imagen en '${normalized}' -> .jpg`);
    return '.jpg';
  }
  
  console.warn(`[getExtensionFromMimeType] Tipo MIME no reconocido: '${normalized}', usando .jpg por defecto`);
  return '.jpg'; // Default
}

/**
 * Extrae el tipo MIME de una URL base64
 * @param base64Url - URL base64 con formato data:mime;base64,data
 * @returns Tipo MIME extraído o 'image/jpeg' por defecto
 */
function getMimeTypeFromBase64(base64Url: string): string {
  if (base64Url.startsWith('data:')) {
    const match = base64Url.match(/data:([^;]+);/);
    if (match && match[1]) {
      console.log('[getMimeTypeFromBase64] MIME extraído:', match[1]);
      return match[1];
    }
  }
  console.log('[getMimeTypeFromBase64] Usando MIME por defecto: image/jpeg');
  return 'image/jpeg'; // Default
}

/**
 * Convierte una URL (base64 o blob) a File
 * @param url - URL base64 o blob URL
 * @param fileName - Nombre base del archivo (sin extensión)
 * @param mimeType - Tipo MIME del archivo (puede ser parcial como 'pdf' o completo como 'application/pdf')
 * @returns Promise<File>
 */
async function urlToFile(
  url: string,
  fileName: string,
  mimeType?: string
): Promise<File> {
  console.log('[urlToFile] Iniciando conversión:', { url: url.substring(0, 50) + '...', fileName, mimeType });
  
  // Normalizar el tipo MIME primero
  let finalMimeType = normalizeMimeType(mimeType);
  
  // Si es una blob URL, obtenerla via fetch
  if (url.startsWith('blob:')) {
    const response = await fetch(url);
    const blob = await response.blob();
    // Usar el tipo del blob si está disponible y es válido
    if (blob.type && blob.type.includes('/')) {
      finalMimeType = blob.type;
    }
    const extension = getExtensionFromMimeType(finalMimeType);
    const fileNameWithExt = fileName.includes('.') ? fileName : `${fileName}${extension}`;
    
    const file = new File([blob], fileNameWithExt, { type: finalMimeType });
    console.log('[urlToFile] Blob URL convertido:', {
      name: file.name,
      type: file.type,
      size: file.size
    });
    return file;
  }
  
  // Si es base64, extraer el tipo MIME si no se proporcionó uno válido
  if (url.startsWith('data:') || url.length > 100) {
    const extractedMime = getMimeTypeFromBase64(url);
    // Solo usar el mime extraído si es completo (contiene '/')
    if (extractedMime && extractedMime.includes('/')) {
      finalMimeType = extractedMime;
    }
    
    const extension = getExtensionFromMimeType(finalMimeType);
    const fileNameWithExt = fileName.includes('.') ? fileName : `${fileName}${extension}`;
    
    const file = base64ToFile(url, fileNameWithExt, finalMimeType);
    console.log('[urlToFile] Base64 convertido:', {
      name: file.name,
      type: file.type,
      size: file.size
    });
    return file;
  }
  
  throw new Error(`Formato de URL no soportado: ${url.substring(0, 50)}`);
}

/**
 * Convierte los datos del store de doctor onboarding al formato requerido
 * por el endpoint de registro de doctor
 */
export async function mapDoctorOnboardingToRequest(
  doctorData: DoctorOnboardingSchemaType,
  token: string
): Promise<RegisterDoctorRequest> {
  console.log('[Mapper] Iniciando conversión de datos del doctor...');
  
  // Convertir imagen de perfil a File
  const fotoPerfil = doctorData.urlImg?.url
    ? await urlToFile(doctorData.urlImg.url, 'profile-photo', doctorData.urlImg.type)
    : null;

  if (!fotoPerfil) {
    throw new Error('Foto de perfil es requerida');
  }
  
  console.log('[Mapper] Foto de perfil convertida:', {
    name: fotoPerfil.name,
    type: fotoPerfil.type,
    size: fotoPerfil.size,
    isFile: fotoPerfil instanceof File,
    isBlob: fotoPerfil instanceof Blob
  });

  // Convertir fotos de documentos de base64 a Files (1-2 archivos requeridos)
  if (!doctorData.identityDocumentFile || doctorData.identityDocumentFile.length === 0) {
    throw new Error('Al menos una foto del documento es requerida');
  }

  if (doctorData.identityDocumentFile.length > 2) {
    throw new Error('Máximo 2 fotos del documento permitidas');
  }

  const fotoDocumento = await Promise.all(
    doctorData.identityDocumentFile.map(async (doc, index) => {
      const file = await urlToFile(doc.url, `document-${index + 1}`, doc.type);
      console.log(`[Mapper] Documento ${index + 1} convertido:`, {
        name: file.name,
        type: file.type,
        size: file.size,
        isFile: file instanceof File,
        isBlob: file instanceof Blob
      });
      return file;
    })
  );

  // Convertir título académico de base64 a Files (1-10 archivos requeridos)
  if (!doctorData.academicTitle) {
    throw new Error('Título académico es requerido');
  }

  // Si academicTitle es un solo archivo, convertirlo a array
  const academicTitles = Array.isArray(doctorData.academicTitle) 
    ? doctorData.academicTitle 
    : [doctorData.academicTitle];

  if (academicTitles.length === 0 || academicTitles.length > 10) {
    throw new Error('Se requieren entre 1 y 10 títulos académicos');
  }

  const tituloAcademico = await Promise.all(
    academicTitles.map(async (title, index) => {
      const file = await urlToFile(
        title.url,
        `academic-title-${index + 1}`,
        title.type
      );
      console.log(`[Mapper] Título académico ${index + 1} convertido:`, {
        name: file.name,
        type: file.type,
        size: file.size,
        isFile: file instanceof File,
        isBlob: file instanceof Blob
      });
      return file;
    })
  );

  // Convertir certificaciones a Files (opcional, 1+ archivos)
  let certificaciones: File[] | undefined;
  if (doctorData.certifications && doctorData.certifications.length > 0) {
    certificaciones = await Promise.all(
      doctorData.certifications.map(async (cert, index) => {
        const file = await urlToFile(
          cert.url,
          `certification-${index + 1}`,
          cert.type
        );
        console.log(`[Mapper] Certificación ${index + 1} convertida:`, {
          name: file.name,
          type: file.type,
          size: file.size,
          isFile: file instanceof File,
          isBlob: file instanceof Blob
        });
        return file;
      })
    );
  }
  
  console.log('[Mapper] Conversión completada exitosamente');

  // Construir el objeto de request
  const request: RegisterDoctorRequest = {
    token,
    nombre: doctorData.name,
    apellido: doctorData.lastName,
    genero: doctorData.gender as 'M' | 'F' | 'O',
    fecha_nacimiento: doctorData.birthDate,
    nacionalidad: doctorData.nationality,
    telefono: doctorData.phone,
    tipo_documento: 'Cédula', // Puedes ajustar esto según tu lógica
    numero_documento: doctorData.identityDocument,
    password: doctorData.password,
    exequatur: doctorData.exequatur,
    
    id_especialidad_principal: parseInt(doctorData.mainSpecialty), // TODO: Asegurarse que sea número
    
    // Campos opcionales
    biografia: undefined, // TODO: Agregar al formulario si se necesita
    ids_especialidades_secundarias: doctorData.secondarySpecialties 
      ? doctorData.secondarySpecialties.map(s => parseInt(s))
      : undefined,
    
    // Archivos
    fotoPerfil,
    fotoDocumento,
    tituloAcademico,
    certificaciones,
    
    // Campos opcionales
    descripciones_documentos: undefined, // TODO: Agregar al formulario si se necesita
    descripciones_titulos: undefined, // TODO: Agregar al formulario si se necesita
    descripciones_certificaciones: undefined, // TODO: Agregar al formulario si se necesita
  };

  return request;
}
