export function ValidateDominicanRNC(input: string): boolean {
  const numero = input.replace(/\D/g, ""); // Quitar cualquier carácter no numérico

  if (numero.length === 9) {
    // Validación RNC (9 dígitos, módulo 11)
    const pesos = [7, 9, 8, 6, 5, 4, 3, 2];
    let suma = 0;
    for (let i = 0; i < 8; i++) {
      const digito = Number(numero.charAt(i));
      if (isNaN(digito)) return false;
      suma += digito * pesos[i];
    }
    const resto = suma % 11;
    let digitoEsperado: number;
    if (resto === 0) digitoEsperado = 2;
    else if (resto === 1) digitoEsperado = 1;
    else digitoEsperado = 11 - resto;
    return digitoEsperado === Number(numero.charAt(8));
  } else if (numero.length === 11) {
    // Validación cédula dominicana (11 dígitos, módulo 10)
    let suma = 0;
    let multiplicador = 2;
    for (let i = numero.length - 2; i >= 0; i--) {
      let temp = Number(numero.charAt(i)) * multiplicador;
      suma += temp > 9 ? Math.floor(temp / 10) + (temp % 10) : temp;
      multiplicador = multiplicador === 2 ? 1 : 2;
    }
    const resto = suma % 10;
    const digitoCalculado = (10 - resto) % 10;
    return digitoCalculado === Number(numero.charAt(10));
  }
  return false;
}
