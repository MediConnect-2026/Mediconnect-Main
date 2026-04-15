export const formatCurrency = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === "") return "RD$ 0.00";

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) return "RD$ 0.00";

  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};
