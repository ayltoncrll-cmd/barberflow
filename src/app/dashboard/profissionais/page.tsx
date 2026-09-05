'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Phone, Mail, Percent, Clock, Edit2, Shield, Award, Calendar, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { mockStore } from '@/lib/store/mockStore';
import { Professional, ProfessionalSchedule } from '@/types';

const DAYS_NAMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export default function ProfissionaisPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProf, setEditingProf] = useState<Professional | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [commissionRate, setCommissionRate] = useState('50');
  const [active, setActive] = useState(true);

  // Barber Schedule Modal States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedProfForSchedule, setSelectedProfForSchedule] = useState<Professional | null>(null);
  const [profSchedules, setProfSchedules] = useState<ProfessionalSchedule[]>([]);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setProfessionals(mockStore.getProfessionals());
  };

  const handleOpenModal = (prof?: Professional) => {
    if (prof) {
      setEditingProf(prof);
      setName(prof.name);
      setPhone(prof.phone || '');
      setEmail(prof.email || '');
      setBio(prof.bio || '');
      setCommissionRate(prof.commissionRate.toString());
      setActive(prof.active);
    } else {
      setEditingProf(null);
      setName('');
      setPhone('');
      setEmail('');
      setBio('');
      setCommissionRate('50');
      setActive(true);
    }
    setIsModalOpen(true);
  };

  const handleOpenScheduleModal = (prof: Professional) => {
    setSelectedProfForSchedule(prof);
    const allSchedules = mockStore.getProfessionalSchedules();
    let profDays = allSchedules.filter((s) => s.professionalId === prof.id);

    // If professional doesn't have custom schedules yet, initialize default 7 days
    if (profDays.length === 0) {
      profDays = Array.from({ length: 7 }, (_, day) => ({
        id: `ps-${prof.id}-${day}`,
        professionalId: prof.id,
        dayOfWeek: day,
        startTime: '08:00',
        endTime: '19:00',
        breakStart: '12:00',
        breakEnd: '13:00',
        isWorking: day !== 0,
      }));
    }

    setProfSchedules(profDays);
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfForSchedule) return;

    const allSchedules = mockStore.getProfessionalSchedules();
    const otherSchedules = allSchedules.filter((s) => s.professionalId !== selectedProfForSchedule.id);

    mockStore.updateProfessionalSchedules([...otherSchedules, ...profSchedules]);
    setIsScheduleModalOpen(false);
    refreshData();
  };

  const handleScheduleChange = (dayOfWeek: number, field: keyof ProfessionalSchedule, value: any) => {
    const updated = profSchedules.map((ps) => {
      if (ps.dayOfWeek === dayOfWeek) {
        return { ...ps, [field]: value };
      }
      return ps;
    });
    setProfSchedules(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProf) {
      mockStore.updateProfessional(editingProf.id, {
        name,
        phone,
        email,
        bio,
        commissionRate: parseFloat(commissionRate),
        active,
      });
    } else {
      mockStore.addProfessional({
        barbershopId: 'b1111111-1111-1111-1111-111111111111',
        name,
        phone,
        email,
        bio,
        commissionRate: parseFloat(commissionRate),
        active,
      });
    }
    refreshData();
    setIsModalOpen(false);
  };

  const toggleStatus = (prof: Professional) => {
    mockStore.updateProfessional(prof.id, { active: !prof.active });
    refreshData();
  };

  const handleDeleteProf = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este barbeiro?')) {
      mockStore.deleteProfessional(id);
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-amber-400" /> Equipe de Barbeiros & Horários de Trabalho
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Cadastre os profissionais, taxas de comissão e horários de trabalho individuais.
          </p>
        </div>
        <Button variant="gold" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" /> Cadastrar Barbeiro
        </Button>
      </div>

      {/* Staff Grid */}
      {professionals.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center text-slate-400 text-sm">
          Nenhum barbeiro cadastrado. Clique no botão acima para cadastrar seu primeiro profissional.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {professionals.map((prof) => (
            <div
              key={prof.id}
              className={`glass-card p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                prof.active ? 'border-slate-800 hover:border-amber-500/40' : 'border-red-900/30 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-500/30 overflow-hidden">
                    {prof.avatarUrl ? (
                      <img src={prof.avatarUrl} alt={prof.name} className="w-full h-full object-cover" />
                    ) : (
                      prof.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{prof.name}</h3>
                    <Badge variant={prof.active ? 'emerald' : 'red'} className="mt-1">
                      {prof.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {prof.bio || 'Sem biografia cadastrada.'}
                </p>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-amber-400" /> Comissão:
                    </span>
                    <span className="font-bold text-amber-400 font-mono text-sm">{prof.commissionRate}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-blue-400" /> Telefone:
                    </span>
                    <span className="font-mono text-slate-200">{prof.phone || 'Não informado'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenScheduleModal(prof)}
                  className="w-full text-xs"
                >
                  <Clock className="w-4 h-4" /> Configurar Horários de Trabalho
                </Button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => toggleStatus(prof)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
                  >
                    {prof.active ? 'Desativar' : 'Ativar'}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenModal(prof)}
                      className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
                      title="Editar Profissional"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProf(prof.id)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                      title="Excluir Profissional"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Profile Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProf ? 'Editar Barbeiro' : 'Cadastrar Novo Barbeiro'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
              placeholder="Ex: Gabriel Santos"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
                placeholder="(11) 99999-0000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Comissão (%)</label>
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                required
                min={0}
                max={100}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Biografia / Especialidade</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
              placeholder="Ex: Especialista em degradê e visagismo de barba"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="profActiveSwitch"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-amber-500 focus:ring-amber-500"
            />
            <label htmlFor="profActiveSwitch" className="text-sm font-medium text-slate-200">
              Profissional Ativo para receber agendamentos
            </label>
          </div>

          <Button type="submit" variant="gold" className="w-full text-sm py-3 mt-4">
            {editingProf ? 'Salvar Alterações' : 'Cadastrar Barbeiro'}
          </Button>
        </form>
      </Modal>

      {/* Barber Individual Working Hours Modal */}
      {selectedProfForSchedule && (
        <Modal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          title={`Horários de Trabalho: ${selectedProfForSchedule.name}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveSchedule} className="space-y-4">
            <p className="text-xs text-slate-400">
              Configure os dias em que este barbeiro trabalha, seu horário de entrada, saída e o horário do intervalo de almoço.
            </p>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {profSchedules.map((ps) => (
                <div key={ps.dayOfWeek} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{DAYS_NAMES[ps.dayOfWeek]}</span>
                    <label className="flex items-center space-x-2 text-xs text-slate-300 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ps.isWorking}
                        onChange={(e) => handleScheduleChange(ps.dayOfWeek, 'isWorking', e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500"
                      />
                      <span>{ps.isWorking ? 'Trabalha' : 'Folga'}</span>
                    </label>
                  </div>

                  {ps.isWorking && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1 border-t border-slate-800">
                      <div>
                        <span className="text-slate-400 block mb-1">Entrada:</span>
                        <input
                          type="time"
                          value={ps.startTime}
                          onChange={(e) => handleScheduleChange(ps.dayOfWeek, 'startTime', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Saída:</span>
                        <input
                          type="time"
                          value={ps.endTime}
                          onChange={(e) => handleScheduleChange(ps.dayOfWeek, 'endTime', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Almoço Início:</span>
                        <input
                          type="time"
                          value={ps.breakStart || '12:00'}
                          onChange={(e) => handleScheduleChange(ps.dayOfWeek, 'breakStart', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Almoço Fim:</span>
                        <input
                          type="time"
                          value={ps.breakEnd || '13:00'}
                          onChange={(e) => handleScheduleChange(ps.dayOfWeek, 'breakEnd', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button type="submit" variant="gold" className="w-full py-3">
              <Save className="w-4 h-4" /> Salvar Escala do Barbeiro
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
