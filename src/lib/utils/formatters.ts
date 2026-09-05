import { AppointmentStatus } from '@/types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function formatDateBR(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatTimeBR(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function formatDateTimeBR(dateInput: string | Date): string {
  return `${formatDateBR(dateInput)} às ${formatTimeBR(dateInput)}`;
}

export function getStatusDetails(status: AppointmentStatus): {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  switch (status) {
    case 'SCHEDULED':
      return {
        label: 'Agendado',
        bgClass: 'bg-amber-500/10 dark:bg-amber-500/20',
        textClass: 'text-amber-600 dark:text-amber-400',
        borderClass: 'border-amber-500/30',
      };
    case 'CONFIRMED':
      return {
        label: 'Confirmado',
        bgClass: 'bg-blue-500/10 dark:bg-blue-500/20',
        textClass: 'text-blue-600 dark:text-blue-400',
        borderClass: 'border-blue-500/30',
      };
    case 'IN_SERVICE':
      return {
        label: 'Em Atendimento',
        bgClass: 'bg-purple-500/10 dark:bg-purple-500/20',
        textClass: 'text-purple-600 dark:text-purple-400',
        borderClass: 'border-purple-500/30',
      };
    case 'COMPLETED':
      return {
        label: 'Concluído',
        bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        textClass: 'text-emerald-600 dark:text-emerald-400',
        borderClass: 'border-emerald-500/30',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelado',
        bgClass: 'bg-red-500/10 dark:bg-red-500/20',
        textClass: 'text-red-600 dark:text-red-400',
        borderClass: 'border-red-500/30',
      };
    case 'NO_SHOW':
      return {
        label: 'Não Compareceu',
        bgClass: 'bg-zinc-500/10 dark:bg-zinc-500/20',
        textClass: 'text-zinc-600 dark:text-zinc-400',
        borderClass: 'border-zinc-500/30',
      };
    default:
      return {
        label: status,
        bgClass: 'bg-gray-100',
        textClass: 'text-gray-700',
        borderClass: 'border-gray-200',
      };
  }
}
