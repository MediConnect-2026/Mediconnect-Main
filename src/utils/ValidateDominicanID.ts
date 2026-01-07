export function ValidateDominicanID(id: string): boolean {
  const value = id.replace(/-/g, "").trim();

  if (!/^\d{11}$/.test(value)) return false;
  if (value === "00000000000") return false;

  let sum = 0;

  for (let i = 0; i < 10; i++) {
    const num = parseInt(value[i], 10);
    const multiplier = i % 2 === 0 ? 1 : 2;
    let result = num * multiplier;

    if (result > 9) {
      result = Math.floor(result / 10) + (result % 10);
    }

    sum += result;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(value[10], 10);
}
