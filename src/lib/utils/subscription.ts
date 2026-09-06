import { Subscription, SubscriptionStatus } from '@/types';

/** Rótulos em português exibidos na interface. */
export const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, string> = {
  TRIAL: 'Período de teste',
  ACTIVE: 'Ativa',
  EXPIRED: 'Vencida',
  SUSPENDED: 'Suspensa',
  CANCELLED: 'Cancelada',
};

export const SUBSCRIPTION_STATUS_VARIANT: Record<
  SubscriptionStatus,
  'gold' | 'emerald' | 'blue' | 'purple' | 'red' | 'zinc'
> = {
  TRIAL: 'blue',
  ACTIVE: 'emerald',
  EXPIRED: 'red',
  SUSPENDED: 'gold',
  CANCELLED: 'zinc',
};

export const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  'TRIAL',
  'ACTIVE',
  'EXPIRED',
  'SUSPENDED',
  'CANCELLED',
];

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Dias restantes até o vencimento do período vigente.
 * Zero significa "vence hoje"; negativo significa que já venceu.
 */
export function getDaysRemaining(subscription: Subscription, now: Date = new Date()): number {
  const reference =
    subscription.status === 'TRIAL' ? subscription.trialEndsAt : subscription.currentPeriodEnd;
  const end = startOfDay(new Date(reference));
  const today = startOfDay(now);
  return Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Regra de acesso ao painel da barbearia (item 14 da especificação).
 * Combina status E data — nunca apenas a data.
 */
export function hasActiveAccess(subscription: Subscription, now: Date = new Date()): boolean {
  switch (subscription.status) {
    case 'ACTIVE':
      // Ativa continua liberada enquanto o período vigente não vencer.
      return startOfDay(new Date(subscription.currentPeriodEnd)) >= startOfDay(now);
    case 'TRIAL':
      return startOfDay(new Date(subscription.trialEndsAt)) >= startOfDay(now);
    case 'EXPIRED':
    case 'SUSPENDED':
    case 'CANCELLED':
      return false;
    default:
      return false;
  }
}

/** Mensagem exibida na tela de bloqueio, explicando o motivo. */
export function getBlockReason(subscription: Subscription, formatDate: (d: string) => string): string {
  switch (subscription.status) {
    case 'SUSPENDED':
      return 'Sua conta foi suspensa pela administração do BarberFlow. Entre em contato para regularizar a situação.';
    case 'CANCELLED':
      return 'Sua assinatura foi cancelada. Seus dados continuam salvos e o acesso volta assim que a assinatura for reativada.';
    case 'EXPIRED':
      return `Seu plano venceu em ${formatDate(subscription.currentPeriodEnd)}.`;
    case 'TRIAL':
      return `Seu período de teste terminou em ${formatDate(subscription.trialEndsAt)}.`;
    case 'ACTIVE':
      return `Seu plano venceu em ${formatDate(subscription.currentPeriodEnd)}.`;
    default:
      return 'Sua assinatura está indisponível no momento.';
  }
}

/**
 * Status efetivo: uma assinatura ACTIVE/TRIAL cuja data já passou é tratada
 * como vencida, mantendo status e datas consistentes entre si.
 */
export function getEffectiveStatus(subscription: Subscription, now: Date = new Date()): SubscriptionStatus {
  if ((subscription.status === 'ACTIVE' || subscription.status === 'TRIAL') && !hasActiveAccess(subscription, now)) {
    return 'EXPIRED';
  }
  return subscription.status;
}

export function addDays(dateInput: string | Date, days: number): string {
  const d = new Date(dateInput);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/** Converte 'YYYY-MM-DD' de um <input type="date"> em ISO no fim do dia local. */
export function dateInputToISO(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 23, 59, 59).toISOString();
}

/** Converte ISO para 'YYYY-MM-DD', formato aceito por <input type="date">. */
export function isoToDateInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
