'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Calendar, Award, Scissors, ArrowUpRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { mockStore } from '@/lib/store/mockStore';
import { formatCurrency } from '@/lib/utils/formatters';
import { Appointment, Professional } from '@/types';

export default function FinanceiroPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    setAppointments(mockStore.getAppointments());
    setProfessionals(mockStore.getProfessionals());
  }, []);

  const completedApps = appointments.filter((a) => a.status === 'COMPLETED');
  const totalRevenue = completedApps.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const totalServicesCount = completedApps.length;
  const averageTicket = totalServicesCount > 0 ? totalRevenue / totalServicesCount : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-amber-400" /> Relatório Financeiro & Comissões
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Acompanhe o faturamento total da barbearia e as comissões estimadas para cada barbeiro.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Faturamento Acumulado</span>
          <div className="text-3xl font-extrabold text-white mt-2">{formatCurrency(totalRevenue)}</div>
          <div className="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" /> Calculado a partir de atendimentos concluídos
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Atendimentos</span>
          <div className="text-3xl font-extrabold text-white mt-2">{totalServicesCount} cortes</div>
          <div className="text-xs text-slate-400 mt-2">Atendimentos concluídos</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ticket Médio por Cliente</span>
          <div className="text-3xl font-extrabold text-amber-400 mt-2 font-mono">{formatCurrency(averageTicket)}</div>
          <div className="text-xs text-amber-400/80 mt-2">Média por atendimento</div>
        </div>
      </div>

      {/* Commissions Table per Barber */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-400" /> Detalhamento de Comissões por Barbeiro
        </h2>

        {professionals.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Nenhum barbeiro cadastrado. Cadastre barbeiros na aba{' '}
            <Link href="/dashboard/profissionais" className="text-amber-400 hover:underline font-semibold">
              Profissionais
            </Link>{' '}
            para calcular comissões.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Barbeiro</th>
                  <th className="p-4">Taxa de Comissão</th>
                  <th className="p-4">Faturamento Bruto</th>
                  <th className="p-4">Comissão a Pagar</th>
                  <th className="p-4">Lucro da Barbearia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {professionals.map((prof) => {
                  const profApps = completedApps.filter((a) => a.professionalId === prof.id);
                  const profGross = profApps.reduce((acc, curr) => acc + curr.totalPrice, 0);
                  const commissionVal = (profGross * prof.commissionRate) / 100;
                  const shopProfit = profGross - commissionVal;

                  return (
                    <tr key={prof.id} className="hover:bg-slate-900/40">
                      <td className="p-4 font-bold text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                          {prof.name.slice(0, 2).toUpperCase()}
                        </div>
                        {prof.name}
                      </td>
                      <td className="p-4 font-mono text-amber-400 font-bold">{prof.commissionRate}%</td>
                      <td className="p-4 font-mono font-bold text-white">{formatCurrency(profGross)}</td>
                      <td className="p-4 font-mono font-bold text-emerald-400">{formatCurrency(commissionVal)}</td>
                      <td className="p-4 font-mono text-slate-300">{formatCurrency(shopProfit)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
