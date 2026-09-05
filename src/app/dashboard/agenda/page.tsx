'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Filter, 
  Plus, 
  Clock, 
  User, 
  Scissors, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Phone,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { mockStore } from '@/lib/store/mockStore';
import { formatCurrency, formatTimeBR, formatDateBR, getStatusDetails } from '@/lib/utils/formatters';
import { Appointment, AppointmentStatus, Professional } from '@/types';

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfId, setSelectedProfId] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New manual appointment modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newProfId, setNewProfId] = useState('');
  const [newServiceId, setNewServiceId] = useState('');
  const [newTime, setNewTime] = useState('15:00');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setAppointments(mockStore.getAppointments());
    const profs = mockStore.getProfessionals();
    setProfessionals(profs);
    if (profs.length > 0 && !newProfId) {
      setNewProfId(profs[0].id);
    }
    const servs = mockStore.getServices();
    if (servs.length > 0 && !newServiceId) {
      setNewServiceId(servs[0].id);
    }
  };

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    mockStore.updateAppointmentStatus(id, status);
    refreshData();
    setIsModalOpen(false);
  };

  const handleDeleteAppointment = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este agendamento permanentemente?')) {
      mockStore.deleteAppointment(id);
      refreshData();
      setIsModalOpen(false);
    }
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const res = mockStore.createAppointment({
      barbershopId: 'b1111111-1111-1111-1111-111111111111',
      customerName: newClientName,
      customerPhone: newClientPhone,
      professionalId: newProfId,
      serviceId: newServiceId,
      dateStr: selectedDate,
      timeStr: newTime,
    });

    if (res.success) {
      refreshData();
      setIsNewModalOpen(false);
      setNewClientName('');
      setNewClientPhone('');
    } else {
      alert(res.message);
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    const isSameDate = app.startTime.startsWith(selectedDate);
    const matchesProf = selectedProfId === 'ALL' || app.professionalId === selectedProfId;
    return isSameDate && matchesProf;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-amber-400" /> Agenda Digital da Barbearia
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gerencie agendamentos, altere status, exclua ou adicione novos horários.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="gold" onClick={() => setIsNewModalOpen(true)}>
            <Plus className="w-4 h-4" /> Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Selector */}
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm font-semibold focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-3 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
          >
            Hoje
          </button>
        </div>

        {/* Professional Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 font-medium">Barbeiro:</span>
          <select
            value={selectedProfId}
            onChange={(e) => setSelectedProfId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm font-semibold focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Todos os Barbeiros</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Agenda Grid / List */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <h2 className="text-base font-bold text-white">
            Agendamentos para {formatDateBR(selectedDate)} ({filteredAppointments.length})
          </h2>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            Nenhum agendamento encontrado para esta data. Clique em "+ Novo Agendamento" para adicionar.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAppointments.map((app) => {
              const statusDetails = getStatusDetails(app.status);
              return (
                <div
                  key={app.id}
                  className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all space-y-4 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-amber-400 font-mono font-bold text-base">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimeBR(app.startTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${statusDetails.bgClass} ${statusDetails.textClass}`}>
                        {statusDetails.label}
                      </Badge>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAppointment(app.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                        title="Excluir Agendamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div onClick={() => { setSelectedAppointment(app); setIsModalOpen(true); }}>
                    <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                      {app.customerName}
                    </h3>
                    <div className="flex items-center text-xs text-slate-400 gap-1.5 mt-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{app.customerPhone}</span>
                    </div>
                  </div>

                  <div
                    onClick={() => { setSelectedAppointment(app); setIsModalOpen(true); }}
                    className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300"
                  >
                    <div className="truncate pr-2">
                      <span className="font-semibold text-slate-200">{app.serviceName}</span>
                      <span className="text-slate-500 block">com {app.professionalName}</span>
                    </div>
                    <span className="font-bold text-amber-400 text-sm">{formatCurrency(app.totalPrice)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Appointment Details & Status Update Modal */}
      {selectedAppointment && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Detalhes do Agendamento"
        >
          <div className="space-y-6">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 uppercase font-semibold">Cliente</span>
                <span className="font-bold text-white">{selectedAppointment.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 uppercase font-semibold">Telefone</span>
                <span className="text-amber-400 text-sm font-mono">{selectedAppointment.customerPhone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 uppercase font-semibold">Serviço</span>
                <span className="text-slate-200 text-sm font-medium">{selectedAppointment.serviceName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 uppercase font-semibold">Profissional</span>
                <span className="text-slate-200 text-sm font-medium">{selectedAppointment.professionalName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 uppercase font-semibold">Horário</span>
                <span className="text-white font-mono font-bold">{formatTimeBR(selectedAppointment.startTime)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">Valor Total</span>
                <span className="text-amber-400 font-bold text-base">{formatCurrency(selectedAppointment.totalPrice)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Atualizar Status do Atendimento:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleStatusChange(selectedAppointment.id, 'CONFIRMED')}
                  className="p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold transition-colors text-left"
                >
                  ✓ Confirmado
                </button>
                <button
                  onClick={() => handleStatusChange(selectedAppointment.id, 'IN_SERVICE')}
                  className="p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold transition-colors text-left"
                >
                  ✂ Em Atendimento
                </button>
                <button
                  onClick={() => handleStatusChange(selectedAppointment.id, 'COMPLETED')}
                  className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors text-left"
                >
                  ★ Concluído
                </button>
                <button
                  onClick={() => handleStatusChange(selectedAppointment.id, 'CANCELLED')}
                  className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-colors text-left"
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => handleDeleteAppointment(selectedAppointment.id)}
              >
                <Trash2 className="w-4 h-4" /> Excluir Agendamento Permanentemente
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Manual Appointment Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Novo Agendamento Manual"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Nome do Cliente</label>
            <input
              type="text"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
              placeholder="Ex: Gabriel Souza"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Telefone / WhatsApp</label>
            <input
              type="text"
              value={newClientPhone}
              onChange={(e) => setNewClientPhone(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
              placeholder="(11) 99999-0000"
            />
          </div>

          {professionals.length === 0 ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
              Aviso: Cadastre pelo menos 1 barbeiro em "Profissionais" para concluir um agendamento.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Barbeiro</label>
                <select
                  value={newProfId}
                  onChange={(e) => setNewProfId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
                >
                  {professionals.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Horário</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
                />
              </div>
            </div>
          )}

          <Button type="submit" variant="gold" className="w-full text-sm py-2.5 mt-2">
            Confirmar Agendamento Manual
          </Button>
        </form>
      </Modal>
    </div>
  );
}
