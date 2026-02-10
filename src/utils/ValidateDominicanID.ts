export function ValidateDominicanID(cedula: string): boolean {
  // Quitar guiones o espacios
  const num = cedula.replace(/\D/g, "");

  if (num.length !== 11) return false;

  let suma = 0;
  let multiplicador = 2;

  // Recorremos los primeros 10 dígitos de derecha a izquierda
  for (let i = 9; i >= 0; i--) {
    let resultado = Number(num[i]) * multiplicador;

    // Si es mayor que 9, sumar dígitos
    if (resultado > 9) {
      resultado = Math.floor(resultado / 10) + (resultado % 10);
    }

    suma += resultado;

    // Alternar 2 y 1
    multiplicador = multiplicador === 2 ? 1 : 2;
  }

  const resto = suma % 10;
  const digitoCalculado = (10 - resto) % 10;

  return digitoCalculado === Number(num[10]);
}
