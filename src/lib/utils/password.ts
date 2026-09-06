export interface PasswordRule {
  label: string;
  valid: boolean;
}

/** Regras mínimas de senha usadas no cadastro da barbearia e na troca de senha do admin. */
export function getPasswordRules(password: string): PasswordRule[] {
  return [
    { label: 'Mínimo de 8 caracteres', valid: password.length >= 8 },
    { label: 'Uma letra maiúscula', valid: /[A-Z]/.test(password) },
    { label: 'Uma letra minúscula', valid: /[a-z]/.test(password) },
    { label: 'Um número', valid: /[0-9]/.test(password) },
  ];
}

export function getPasswordScore(password: string): number {
  return getPasswordRules(password).filter((r) => r.valid).length;
}

export function isPasswordValid(password: string): boolean {
  return getPasswordRules(password).every((r) => r.valid);
}

export const PASSWORD_STRENGTH = {
  labels: ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'],
  barColors: ['bg-slate-700', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'],
  textColors: ['text-slate-500', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-emerald-400'],
};
