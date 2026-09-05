'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  Calendar, 
  Users, 
  TrendingUp, 
  Scissors, 
  Clock, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { mockStore } from '@/lib/store/mockStore';
import { formatCurrency, formatTimeBR, getStatusDetails } from '@/lib/utils/formatters';
import { Appointment, Professional, Service } from '@/types';

export default function DashboardOverviewPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    setAppointments(mockStore.getAppointments());
    setProfessionals(mockStore.getProfessionals());
    setServices(mockStore.getServices());
  }, []);

  const todayISO = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.startTime.startsWith(todayISO));

  const todayRevenue = todayAppointments
    .filter((a) => a.status === 'COMPLETED' || a.status === 'CONFIRMED')
    .reduce((acc, curr) => acc + curr.totalPrice, 0);

  const completedApps = appointments.filter((a) => a.status === 'COMPLETED');
  const monthRevenue = completedApps.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const completedTodayCount = todayAppointments.filter((a) => a.status === 'COMPLETED').length;
  
  const upcomingAppointments = todayAppointments
    .filter((a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const averageTicket = completedApps.length > 0 ? monthRevenue / completedApps.length : 0;

  // Compute actual performance per barber
  const barberPerformance = professionals.map((prof) => {
    const profApps = completedApps.filter((a) => a.professionalId === prof.id);
    const total = profApps.reduce((sum, a) => sum + a.totalPrice, 0);
    return {
      name: prof.name,
      count: profApps.length,
      total,
    };
  });

  const maxBarberRevenue = Math.max(...barberPerformance.map((b) => b.total), 1);

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Visão Geral da Barbearia <Sparkles className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Resumo de faturamento, agendamentos de hoje e métricas de desempenho.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/agenda">
            <Button variant="gold" size="sm">
              <Calendar className="w-4 h-4" /> Ver Agenda Completa
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Faturamento Hoje */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Faturamento Hoje</span>
              <div className="text-2xl font-extrabold text-white mt-1">{formatCurrency(todayRevenue)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-amber-400/90 font-medium">
            Baseado em atendimentos confirmados e concluídos
          </div>
        </div>

        {/* Card 2: Agendamentos Hoje */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agendamentos Hoje</span>
              <div className="text-2xl font-extrabold text-white mt-1">{todayAppointments.length} clientes</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-blue-400 font-medium">
            {completedTodayCount} concluídos · {upcomingAppointments.length} a atender
          </div>
        </div>

        {/* Card 3: Faturamento do Mês */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Faturamento no Mês</span>
              <div className="text-2xl font-extrabold text-white mt-1">{formatCurrency(monthRevenue)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-emerald-400 font-medium">
            {completedApps.length} cortes concluídos
          </div>
        </div>

        {/* Card 4: Ticket Médio */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ticket Médio</span>
              <div className="text-2xl font-extrabold text-white mt-1">{formatCurrency(averageTicket)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Scissors className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-purple-400 font-medium">
            Por atendimento concluído
          </div>
        </div>
      </div>

      {/* Setup Guide Banner if Empty */}
      {professionals.length === 0 && services.length === 0 && (
        <div className="glass-panel p-6 rounded-2xl border-2 border-amber-500/40 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Sua barbearia está pronta para ser configurada!</h2>
              <p className="text-xs text-slate-400">Cadastre seus serviços e profissionais para liberar o agendamento online dos seus clientes.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/dashboard/servicos">
              <Button variant="gold" size="sm">
                <Plus className="w-4 h-4" /> 1. Cadastrar Serviços
              </Button>
            </Link>
            <Link href="/dashboard/profissionais">
              <Button variant="secondary" size="sm">
                <Plus className="w-4 h-4" /> 2. Cadastrar Profissionais
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Próximos Atendimentos de Hoje (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" /> Próximos Horários de Hoje
            </h2>
            <Link href="/dashboard/agenda" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
              Nenhum agendamento pendente para o dia de hoje.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((app) => {
                const statusDetails = getStatusDetails(app.status);
                return (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between hover:border-amber-500/30 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold text-sm">
                        {formatTimeBR(app.startTime)}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{app.customerName}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {app.serviceName} com <span className="text-slate-200">{app.professionalName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-white text-sm">{formatCurrency(app.totalPrice)}</span>
                      <Badge className={`${statusDetails.bgClass} ${statusDetails.textClass}`}>
                        {statusDetails.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Breakdown Widgets (1 col) */}
        <div className="space-y-6">
          {/* Desempenho por Profissional */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-base font-bold text-white mb-4">Desempenho por Barbeiro</h3>
            {barberPerformance.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">Nenhum barbeiro cadastrado ainda.</div>
            ) : (
              <div className="space-y-4">
                {barberPerformance.map((bp, i) => {
                  const pct = Math.round((bp.total / maxBarberRevenue) * 100);
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-200">{bp.name}</span>
                        <span className="text-amber-400">{formatCurrency(bp.total)} ({bp.count} cortes)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.max(pct, 5)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Serviços Cadastrados */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-base font-bold text-white mb-4">Serviços Cadastrados ({services.length})</h3>
            {services.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">
                Nenhum serviço cadastrado.{' '}
                <Link href="/dashboard/servicos" className="text-amber-400 hover:underline font-semibold">
                  Cadastrar agora
                </Link>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                {services.slice(0, 4).map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-200 font-medium">{s.name}</span>
                    <span className="font-bold text-amber-400 font-mono">{formatCurrency(s.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
