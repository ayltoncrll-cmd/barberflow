'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SubscriptionStatus } from '@/types';
import { SUBSCRIPTION_STATUS_LABEL, SUBSCRIPTION_STATUS_VARIANT } from '@/lib/utils/subscription';

/** Badge de status da assinatura, sempre em português. */
export const StatusBadge: React.FC<{ status: SubscriptionStatus }> = ({ status }) => (
  <Badge variant={SUBSCRIPTION_STATUS_VARIANT[status]}>{SUBSCRIPTION_STATUS_LABEL[status]}</Badge>
);

/** Badge de urgência baseada nos dias restantes (item 9 da especificação). */
export const ExpiryBadge: React.FC<{ daysRemaining: number; hasAccess: boolean }> = ({
  daysRemaining,
  hasAccess,
}) => {
  if (!hasAccess) {
    const overdue = Math.abs(daysRemaining);
    return <Badge variant="red">{overdue === 0 ? 'Bloqueada' : `Vencida há ${overdue}d`}</Badge>;
  }
  if (daysRemaining === 0) return <Badge variant="red">Vence hoje</Badge>;
  if (daysRemaining <= 3) return <Badge variant="gold">{daysRemaining}d restantes</Badge>;
  if (daysRemaining <= 7) return <Badge variant="blue">{daysRemaining}d restantes</Badge>;
  return <Badge variant="emerald">{daysRemaining}d restantes</Badge>;
};

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ElementType;
  accent?: 'purple' | 'emerald' | 'blue' | 'gold' | 'red' | 'slate';
}

const accentMap = {
  purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  gold: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  slate: { text: 'text-slate-200', bg: 'bg-slate-500/10', border: 'border-slate-700' },
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, hint, icon: Icon, accent = 'slate' }) => {
  const a = accentMap[accent];
  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider leading-tight">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg ${a.bg} ${a.border} border flex items-center justify-center shrink-0`}>
            <Icon className={`w-4 h-4 ${a.text}`} />
          </div>
        )}
      </div>
      <div className={`text-3xl font-extrabold ${a.text}`}>{value}</div>
      {hint && <div className="text-xs text-slate-500">{hint}</div>}
    </div>
  );
};

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  variant?: 'danger' | 'default';
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Modal de confirmação usado em todas as ações administrativas sensíveis. */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  variant = 'default',
  isLoading = false,
  onConfirm,
  onClose,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
            variant === 'danger'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="text-sm text-slate-300 leading-relaxed">{message}</div>
      </div>
      <div className="flex gap-3 pt-2 border-t border-slate-800">
        <Button variant="secondary" onClick={onClose} className="flex-1" disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'gold'}
          onClick={onConfirm}
          className="flex-1"
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  </Modal>
);

export interface ToastState {
  type: 'success' | 'error';
  message: string;
}

/** Mensagem flutuante de sucesso/erro, some sozinha após 3,5s. */
export const Toast: React.FC<{ toast: ToastState | null; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  return (
    <div className="fixed top-4 right-4 z-[60] animate-in fade-in slide-in-from-top-2 duration-200 max-w-sm">
      <div
        className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-sm font-medium ${
          isSuccess
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
            : 'bg-red-500/15 border-red-500/40 text-red-200'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
        ) : (
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
        )}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};

/** Estado de carregamento padrão das telas do admin. */
export const AdminLoading: React.FC<{ label?: string }> = ({ label = 'Carregando...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
    <Loader2 className="w-7 h-7 animate-spin text-purple-400" />
    <span className="text-sm">{label}</span>
  </div>
);

/** Estado vazio das tabelas. */
export const EmptyState: React.FC<{ message: string; hint?: string }> = ({ message, hint }) => (
  <div className="text-center py-14 px-4">
    <p className="text-slate-300 font-semibold">{message}</p>
    {hint && <p className="text-sm text-slate-500 mt-1">{hint}</p>}
  </div>
);
