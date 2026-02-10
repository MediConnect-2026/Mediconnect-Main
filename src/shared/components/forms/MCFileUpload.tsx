import React, { useState, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Upload, X, FileText, Image as ImageIcon, File } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { UploadedFile } from "@/schema/verifyInfo.schema";

interface MCFileUploadProps {
  name: string;
  label?: string;
  placeholder?: string;
  accept?: string;
  maxSize?: number; // en MB
  multiple?: boolean;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  status?: "default" | "error" | "success" | "warning" | "loading";
  statusMessage?: string;
  helperText?: string;
  variant?: "edit" | "default";
  standalone?: boolean;
  onFileChange?: (file: UploadedFile | UploadedFile[]) => void;
}

function MCFileUpload({
  name,
  label,
  placeholder,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSize = 5,
  multiple = false,
  className,
  required = false,
  disabled = false,
  size = "medium",
  status = "default",
  statusMessage,
  helperText,
  variant = "default",
  standalone = false,
  onFileChange,
}: MCFileUploadProps) {
  const formContext = standalone ? null : useFormContext();
  const { t } = useTranslation("common");

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStatusColor = () => {
    switch (status) {
      case "error":
        return "border-red-500 focus:border-red-500";
      case "success":
        return "border-green-500 focus:border-green-500";
      case "warning":
        return "border-yellow-500 focus:border-yellow-500";
      case "loading":
        return "border-blue-500 focus:border-blue-500";
      default:
        return "border-primary/50 hover:border-primary";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "min-h-[100px] py-3 px-4";
      case "large":
        return "min-h-[200px] py-8 px-8";
      default:
        return "min-h-[140px] py-4 sm:py-6 px-4 sm:px-6";
    }
  };

  const getVariantClasses = () => {
    if (variant === "edit") {
      return "border-none bg-accent text-primary/80";
    }
    return "bg-background";
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="w-5 h-5" />;
    }
    if (fileType === "application/pdf") {
      return <FileText className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Validar tamaño
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `El archivo excede el tamaño máximo de ${maxSize}MB`;
    }

    // Validar tipo
    if (accept) {
      const acceptedTypes = accept.split(",").map((type) => type.trim());
      const fileExtension = "." + file.name.split(".").pop();
      const fileMimeType = file.type;

      const isValid = acceptedTypes.some(
        (type) =>
          type === fileExtension.toLowerCase() ||
          type === fileMimeType ||
          (type.endsWith("/*") &&
            fileMimeType.startsWith(type.replace("/*", ""))),
      );

      if (!isValid) {
        return `Tipo de archivo no permitido. Formatos aceptados: ${accept}`;
      }
    }

    return null;
  };

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    const newFiles = multiple ? [...files, ...validFiles] : validFiles;
    setFiles(newFiles);

    // Convertir a UploadedFile para el store
    const uploadedFiles = newFiles.map((file) => ({
      url: URL.createObjectURL(file), // En producción, esto sería la URL del servidor
      name: file.name,
      type: file.type,
    }));

    // Actualizar formulario
    if (!standalone && formContext) {
      formContext.setValue(name, multiple ? uploadedFiles : uploadedFiles[0], {
        shouldValidate: true,
      });
    }

    // Callback
    if (onFileChange) {
      onFileChange(multiple ? uploadedFiles : uploadedFiles[0]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);

    const uploadedFiles = newFiles.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
    }));

    if (!standalone && formContext) {
      formContext.setValue(
        name,
        multiple ? uploadedFiles : uploadedFiles[0] || null,
        { shouldValidate: true },
      );
    }

    if (onFileChange) {
      onFileChange(multiple ? uploadedFiles : uploadedFiles[0] || null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const error = !standalone && formContext?.formState?.errors?.[name];

  return (
    <div className="w-full flex flex-col mb-4 px-0">
      {/* Label */}
      {label && (
        <div className="flex flex-row justify-between items-center mb-2 gap-2">
          <label
            htmlFor={name}
            className="text-left text-base sm:text-lg text-primary"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
      )}

      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "w-full rounded-4xl border-2 border-dashed transition-all cursor-pointer",
          "flex flex-col items-center justify-center gap-3",
          getSizeClasses(),
          handleStatusColor(),
          getVariantClasses(),
          isDragging && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => handleFileChange(e.target.files)}
          className="hidden"
          id={name}
        />

        <div className="flex flex-col items-center gap-2 text-center">
          <div
            className={cn(
              "p-3 rounded-full bg-primary/10",
              size === "small" ? "p-2" : size === "large" ? "p-4" : "p-3",
            )}
          >
            <Upload
              className={cn(
                "text-primary",
                size === "small"
                  ? "w-5 h-5"
                  : size === "large"
                    ? "w-8 h-8"
                    : "w-6 h-6",
              )}
            />
          </div>

          <div>
            <p className="text-primary font-medium">
              {placeholder || "Haz clic o arrastra archivos aquí"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {accept} (máx. {maxSize}MB)
            </p>
          </div>
        </div>
      </div>

      {/* Helper Text */}
      {helperText && (
        <p className="text-sm text-muted-foreground mt-2">{helperText}</p>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-primary/70">{getFileIcon(file.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="ml-2 p-1 hover:bg-destructive/10 rounded-full text-destructive transition-colors"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Status Message */}
      {statusMessage && (
        <span
          className={cn(
            "text-sm mt-1 block",
            status === "success"
              ? "text-green-500"
              : status === "error"
                ? "text-red-500"
                : status === "warning"
                  ? "text-yellow-500"
                  : status === "loading"
                    ? "text-blue-500"
                    : "text-gray-500",
          )}
        >
          {statusMessage}
        </span>
      )}

      {/* Form Errors */}
      {error && (
        <span className="text-red-500 text-sm mt-1">
          {String(error?.message)}
        </span>
      )}
    </div>
  );
}

export default MCFileUpload;
