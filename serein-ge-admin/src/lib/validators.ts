// Règle de mot de passe SEREIN-GE : 8 caractères minimum, au moins un
// chiffre, un caractère spécial, une majuscule et une minuscule.
export function getPasswordRuleErrors(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) errors.push('8 caractères minimum');
  if (!/[0-9]/.test(password)) errors.push('au moins un chiffre');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('au moins un caractère spécial');
  if (!/[A-Z]/.test(password)) errors.push('au moins une majuscule');
  if (!/[a-z]/.test(password)) errors.push('au moins une minuscule');
  return errors;
}

export function isPasswordValid(password: string): boolean {
  return getPasswordRuleErrors(password).length === 0;
}

export const PASSWORD_RULE_HINT =
  '8 caractères minimum, avec au moins un chiffre, un caractère spécial, une majuscule et une minuscule.';
