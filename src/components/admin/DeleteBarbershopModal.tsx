'use client';

import React, { useEffect, useState } from 'react';
import { Trash2, AlertTriangle, XCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AdminBarbershopRow, AdminUsageStats } from '@/types';

interface Props {
  isOpen: boolean;
  row: AdminBarbershopRow | null;
  usage: AdminUsageStats | null;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Exclusão definitiva de uma barbearia.
 * Exige digitar o nome exato — é irreversível e leva junto todos os dados.
 */
export const DeleteBarbershopModal: React.FC<Props> = ({ isOpen, row, usage, onClose, onConfirm }) => {
  const [typed, setTyped] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Limpa o campo sempre que abrir para outra barbearia.
  useEffect(() => {
    if (isOpen) {
      setTyped('');
      setIsLoading(false);
    }
  }, [isOpen, row?.barbershop.id]);

  if (!row) return null;

  const { barbershop, ownerName, plan, subscription } = row;
  const matches = typed.trim().toLowerCase() === barbershop.name.trim().toLowerCase();

  const totals = usage
    ? [
        { label: 'profissionais', value: usage.professionals },
        { label: 'clientes', value: usage.customers },
        { label: 'serviços', value: usage.services },
        { label: 'agendamentos', value: usage.appointments },
      ].filter((t) => t.value > 0)
    : [];

  const handleConfirm = () => {
    if (!matches) return;
    setIsLoading(true);
    setTimeout(onConfirm, 400);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Excluir barbearia" maxWidth="md">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-sm text-slate-300 leading-relaxed">
            Você está prestes a excluir <strong className="text-white">{barbershop.name}</strong> ({ownerName}).
            <strong className="text-red-400"> Esta ação é definitiva e não pode ser desfeita.</strong>
          </div>
        </div>

        <div className="bg-slate-900/60 rounded-xl p-4 border border-red-500/20 space-y-2">
          <div className="text-xs font-semibold text-red-300 uppercase tracking-wider">Será removido junto</div>
          <ul className="text-sm text-slate-300 space-y-1">
            <li className="flex items-center gap-2">
              <span className="text-red-400">•</span> A assinatura {plan?.name} ({subscription.status === 'ACTIVE' ? 'ativa' : 'registrada'})
            </li>
            {totals.length > 0 ? (
              totals.map((t) => (
                <li key={t.label} className="flex items-center gap-2">
                  <span className="text-red-400">•</span>
                  <strong className="text-white">{t.value}</strong> {t.label}
                </li>
              ))
            ) : (
              <li className="flex items-center gap-2 text-slate-500">
                <span className="text-red-400">•</span> Nenhum dado operacional registrado
              </li>
            )}
            <li className="flex items-center gap-2">
              <span className="text-red-400">•</span> A página pública /barbearia/{barbershop.slug}
            </li>
          </ul>
        </div>

        <div className="text-xs text-slate-400 bg-slate-900/40 rounded-xl px-3 py-2.5 border border-slate-800">
          Se a intenção é apenas tirar o acesso mantendo os dados, use{' '}
          <strong className="text-slate-200">Suspender</strong> ou{' '}
          <strong className="text-slate-200">Cancelar</strong> na tela de detalhes.
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Digite <span className="text-red-400 normal-case font-mono">{barbershop.name}</span> para confirmar
          </label>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={barbershop.name}
            autoComplete="off"
            className={`w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 text-sm ${
              typed.length > 0 && !matches
                ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-800 focus:border-purple-500 focus:ring-purple-500'
            }`}
          />
          {typed.length > 0 && !matches && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
              <XCircle className="w-3.5 h-3.5" /> O nome não confere
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2 border-t border-slate-800">
          <Button variant="secondary" onClick={onClose} className="flex-1" disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            className="flex-1"
            disabled={!matches}
            isLoading={isLoading}
          >
            <Trash2 className="w-4 h-4" /> Excluir definitivamente
          </Button>
        </div>
      </div>
    </Modal>
  );
};
