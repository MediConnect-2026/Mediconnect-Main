export function validatePassport(passport: string): boolean {
  return /^[A-Z][A-Z0-9]{5,8}$/i.test(passport.trim());
}
