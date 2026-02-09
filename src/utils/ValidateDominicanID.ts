export function ValidateDominicanID(id: string): boolean {
  // Remove hyphens from the ID
  const cleanId = id.replace(/-/g, "");

  // Check if length is less than 11 characters
  if (cleanId.length < 11) {
    return false;
  }

  // Extract the main cedula (first 10 digits) and the verification digit
  const cedula = cleanId.substr(0, cleanId.length - 1);
  const verificador = parseInt(cleanId.substr(cleanId.length - 1, 1));

  let suma = 0;

  // Calculate the sum using the Dominican ID algorithm
  for (let i = 0; i < cedula.length; i++) {
    const digit = parseInt(cedula.substr(i, 1));
    let mod = i % 2 === 0 ? 1 : 2;
    let res = digit * mod;

    // If result is greater than 9, sum its digits
    if (res > 9) {
      const resStr = res.toString();
      const uno = parseInt(resStr.substr(0, 1));
      const dos = parseInt(resStr.substr(1, 1));
      res = uno + dos;
    }

    suma += res;
  }

  // Calculate the verification number
  const numeroVerificacion = (10 - (suma % 10)) % 10;

  // Validate: verification number matches and first 3 digits are not "000"
  if (numeroVerificacion === verificador && cedula.substr(0, 3) !== "000") {
    return true;
  }

  return false;
}
