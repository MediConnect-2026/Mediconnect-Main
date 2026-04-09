/**
 * Utilidad para comprimir imágenes antes de subirlas
 * Usa Canvas API del navegador para reducir el tamaño de archivos grandes
 */

/**
 * Comprime una imagen si supera el tamaño máximo especificado
 * 
 * @param file - Archivo de imagen a comprimir
 * @param maxSizeMB - Tamaño máximo en MB (por defecto 1 MB)
 * @param quality - Calidad de compresión para JPEG (0-1, por defecto 0.8)
 * @returns Promise con el archivo comprimido o el original si no necesita compresión
 */
export async function compressImage(
  file: File,
  maxSizeMB: number = 1,
  quality: number = 0.8
): Promise<{ file: File; wasCompressed: boolean; originalSize: number; compressedSize: number }> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const originalSize = file.size;

  // Si el archivo ya es pequeño, retornarlo sin comprimir
  if (file.size <= maxSizeBytes) {
    return {
      file,
      wasCompressed: false,
      originalSize,
      compressedSize: originalSize,
    };
  }

  // Validar que es una imagen
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo no es una imagen válida");
  }

  // No comprimir GIFs animados para no perder la animación
  if (file.type === "image/gif") {
    return {
      file,
      wasCompressed: false,
      originalSize,
      compressedSize: originalSize,
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Crear canvas con las dimensiones de la imagen
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Reducir dimensiones si la imagen es muy grande (>2000px en cualquier lado)
        const maxDimension = 2000;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen en canvas
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo obtener el contexto del canvas"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a blob con compresión
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Error al comprimir la imagen"));
              return;
            }

            // Extraer nombre sin extensión y agregar sufijo
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
            const extension = file.type === "image/png" ? "png" : "jpg";
            const newFileName = `${nameWithoutExt}-compressed.${extension}`;

            // Crear nuevo File con el blob comprimido
            const compressedFile = new File([blob], newFileName, {
              type: file.type === "image/png" ? "image/png" : "image/jpeg",
              lastModified: Date.now(),
            });

            resolve({
              file: compressedFile,
              wasCompressed: true,
              originalSize,
              compressedSize: compressedFile.size,
            });
          },
          // Usar PNG solo si el original era PNG, sino JPEG
          file.type === "image/png" ? "image/png" : "image/jpeg",
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("Error al cargar la imagen"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Error al leer el archivo"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Comprime múltiples imágenes en paralelo
 * 
 * @param files - Array de archivos a comprimir
 * @param maxSizeMB - Tamaño máximo en MB
 * @param onProgress - Callback opcional para reportar progreso (0-100)
 * @returns Promise con array de resultados de compresión
 */
export async function compressImages(
  files: File[],
  maxSizeMB: number = 1,
  onProgress?: (progress: number) => void
): Promise<{ file: File; wasCompressed: boolean; originalSize: number; compressedSize: number }[]> {
  const results: { file: File; wasCompressed: boolean; originalSize: number; compressedSize: number }[] = [];
  let completed = 0;

  for (const file of files) {
    try {
      const result = await compressImage(file, maxSizeMB);
      results.push(result);
    } catch (error) {
      console.error(`Error comprimiendo ${file.name}:`, error);
      // En caso de error, usar el archivo original
      results.push({
        file,
        wasCompressed: false,
        originalSize: file.size,
        compressedSize: file.size,
      });
    }

    completed++;
    if (onProgress) {
      onProgress(Math.round((completed / files.length) * 100));
    }
  }

  return results;
}

/**
 * Calcula el porcentaje de reducción de tamaño
 */
export function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) return 0;
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}
