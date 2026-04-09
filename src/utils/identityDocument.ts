const DOMINICAN_ID_MAX_DIGITS = 11;

export const normalizeIdentityDocumentDigits = (
  value?: string,
  maxDigits: number = DOMINICAN_ID_MAX_DIGITS
): string => String(value ?? "").replace(/\D/g, "").slice(0, maxDigits);

export const formatDominicanCedula = (value?: string): string => {
  const digits = normalizeIdentityDocumentDigits(value, DOMINICAN_ID_MAX_DIGITS);

  if (digits.length <= 3) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3)}`;

  return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`;
};
