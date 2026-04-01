export type PhoneFormatStyle = "do" | "us" | "international";

interface FormatPhoneOptions {
  style?: PhoneFormatStyle;
  partial?: boolean;
  emptyValue?: string;
  preserveOriginalOnInvalid?: boolean;
}

function formatTenDigitPhone(digits: string): string | null {
  if (digits.length !== 10) {
    return null;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatInternationalPhone(digits: string): string | null {
  if (digits.length === 11) {
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 6 + 1)}-${digits.slice(7)}`;
  }

  return formatTenDigitPhone(digits);
}

function formatPartialPhone(digits: string, style: PhoneFormatStyle): string {
  const maxDigits = style === "international" ? 13 : 10;
  const normalizedDigits = digits.slice(0, maxDigits);

  if (!normalizedDigits) {
    return "";
  }

  if (style === "international") {
    if (normalizedDigits.length <= 3) {
      return normalizedDigits;
    }

    if (normalizedDigits.length <= 6) {
      return `${normalizedDigits.slice(0, 3)}-${normalizedDigits.slice(3)}`;
    }

    if (normalizedDigits.length <= 9) {
      return `${normalizedDigits.slice(0, 3)}-${normalizedDigits.slice(3, 6)}-${normalizedDigits.slice(6)}`;
    }

    return `${normalizedDigits.slice(0, 3)}-${normalizedDigits.slice(3, 6)}-${normalizedDigits.slice(6, 9)}-${normalizedDigits.slice(9)}`;
  }

  if (normalizedDigits.length <= 3) {
    return normalizedDigits;
  }

  if (normalizedDigits.length <= 6) {
    return `(${normalizedDigits.slice(0, 3)}) ${normalizedDigits.slice(3)}`;
  }

  return `(${normalizedDigits.slice(0, 3)}) ${normalizedDigits.slice(3, 6)}-${normalizedDigits.slice(6)}`;
}

export function formatPhone(
  phone: string | null | undefined,
  options: FormatPhoneOptions = {},
): string {
  const {
    style = "do",
    partial = false,
    emptyValue = "",
    preserveOriginalOnInvalid = true,
  } = options;

  if (!phone) {
    return emptyValue;
  }

  const originalValue = String(phone);
  const digits = originalValue.replace(/\D/g, "");

  if (!digits) {
    return emptyValue;
  }

  if (partial) {
    return formatPartialPhone(digits, style);
  }

  const formatted =
    style === "international"
      ? formatInternationalPhone(digits)
      : formatTenDigitPhone(digits);

  if (formatted) {
    return formatted;
  }

  return preserveOriginalOnInvalid ? originalValue : digits;
}