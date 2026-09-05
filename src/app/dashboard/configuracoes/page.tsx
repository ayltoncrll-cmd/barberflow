'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Building, Phone, MapPin, Award, CheckCircle2, Save, Clock, Calendar, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { mockStore } from '@/lib/store/mockStore';
import { Barbershop, BusinessHour, HolidayClosure, LoyaltyProgram } from '@/types';

const DAYS_NAMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export default function ConfiguracoesPage() {
  const [shop, setShop] = useState<Barbershop>(mockStore.getBarbershop());
  const [loyalty, setLoyalty] = useState<LoyaltyProgram>(mockStore.getLoyaltyProgram());
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [holidays, setHolidays] = useState<HolidayClosure[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Holiday Modal Form State
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayTitle, setHolidayTitle] = useState('');
  const [holidayIsClosed, setHolidayIsClosed] = useState(true);
  const [holidayOpenTime, setHolidayOpenTime] = useState('09:00');
  const [holidayCloseTime, setHolidayCloseTime] = useState('14:00');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setShop(mockStore.getBarbershop());
    setLoyalty(mockStore.getLoyaltyProgram());
    setBusinessHours(mockStore.getBusinessHours());
    setHolidays(mockStore.getHolidayClosures());
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    mockStore.updateBarbershop(shop);
    mockStore.updateBusinessHours(businessHours);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleHourChange = (dayOfWeek: number, field: keyof BusinessHour, value: any) => {
    const updated = businessHours.map((bh) => {
      if (bh.dayOfWeek === dayOfWeek) {
        return { ...bh, [field]: value };
      }
      return bh;
    });
    setBusinessHours(updated);
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayDate || !holidayTitle) return;

    mockStore.addHolidayClosure({
      barbershopId: shop.id,
      date: holidayDate,
      title: holidayTitle,
      isClosed: holidayIsClosed,
      openTime: holidayOpenTime,
      closeTime: holidayCloseTime,
    });

    setHolidays(mockStore.getHolidayClosures());
    setIsHolidayModalOpen(false);
    setHolidayDate('');
    setHolidayTitle('');
  };

  const handleDeleteHoliday = (id: string) => {
    mockStore.deleteHolidayClosure(id);
    setHolidays(mockStore.getHolidayClosures());
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-400" /> Configurações Gerais & Horários da Barbearia
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Altere dados do estabelecimento, horários de funcionamento por dia da semana e exceções de feriados.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> Configurações e horários salvos com sucesso!
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Shop Info Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building className="w-5 h-5 text-amber-400" /> Perfil da Barbearia
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Nome da Barbearia</label>
              <input
                type="text"
                value={shop.name}
                onChange={(e) => setShop({ ...shop, name: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Slug / Endereço Personalizado</label>
              <input
                type="text"
                value={shop.slug}
                readOnly
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-amber-400 font-mono text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                value={shop.phone}
                onChange={(e) => setShop({ ...shop, phone: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Cidade / UF</label>
              <input
                type="text"
                value={`${shop.city} - ${shop.state}`}
                onChange={(e) => {
                  const parts = e.target.value.split('-');
                  setShop({ ...shop, city: parts[0]?.trim() || '', state: parts[1]?.trim() || '' });
                }}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Endereço Completo</label>
            <input
              type="text"
              value={shop.address}
              onChange={(e) => setShop({ ...shop, address: e.target.value })}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
            />
          </div>
        </div>

        {/* BARBERSHOP GENERAL OPERATING HOURS PER DAY */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Clock className="w-5 h-5 text-amber-400" /> Horário de Funcionamento Geral (Segunda a Domingo)
          </h2>
          <p className="text-xs text-slate-400">
            Defina o horário de abertura e fechamento da barbearia para cada dia da semana. Os agendamentos online usarão estas janelas de horário.
          </p>

          <div className="space-y-3">
            {businessHours.map((bh) => (
              <div key={bh.dayOfWeek} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3 w-40">
                  <span className="font-bold text-white text-sm">{DAYS_NAMES[bh.dayOfWeek]}</span>
                </div>

                <div className="flex items-center gap-4 flex-1">
                  <label className="flex items-center space-x-2 text-xs text-slate-300 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!bh.isClosed}
                      onChange={(e) => handleHourChange(bh.dayOfWeek, 'isClosed', !e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500"
                    />
                    <span>{bh.isClosed ? 'Fechado' : 'Aberto'}</span>
                  </label>

                  {!bh.isClosed && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Abre:</span>
                      <input
                        type="time"
                        value={bh.openTime}
                        onChange={(e) => handleHourChange(bh.dayOfWeek, 'openTime', e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                      />
                      <span className="text-slate-400">Fecha:</span>
                      <input
                        type="time"
                        value={bh.closeTime}
                        onChange={(e) => handleHourChange(bh.dayOfWeek, 'closeTime', e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HOLIDAYS & SPECIAL DAYS CLOSURES */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" /> Feriados & Exceções de Funcionamento
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Cadastre datas comemorativas ou feriados e configure se a barbearia abrirá em horário especial ou estará fechada.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsHolidayModalOpen(true)}>
              <Plus className="w-4 h-4" /> Cadastrar Feriado
            </Button>
          </div>

          {holidays.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs">
              Nenhum feriado ou dia especial cadastrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {holidays.map((h) => (
                <div key={h.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-sm">{h.title}</div>
                    <div className="text-xs text-amber-400 font-mono mt-0.5">
                      Data: {new Date(`${h.date}T00:00:00`).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {h.isClosed ? (
                        <span className="text-red-400 font-semibold">★ Barbearia Fechada neste dia</span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">
                          ★ Horário Especial: {h.openTime} às {h.closeTime}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteHoliday(h.id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loyalty Program Config Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Award className="w-5 h-5 text-amber-400" /> Regras do Programa de Fidelidade
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Selos (Visitas) para Recompensa</label>
              <input
                type="number"
                value={loyalty.requiredStamps}
                onChange={(e) => setLoyalty({ ...loyalty, requiredStamps: parseInt(e.target.value, 10) || 10 })}
                min={1}
                max={20}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Descrição da Recompensa</label>
              <input
                type="text"
                value={loyalty.rewardDescription}
                onChange={(e) => setLoyalty({ ...loyalty, rewardDescription: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
                placeholder="Ex: 1 Corte Tradicional Grátis"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button type="submit" variant="gold" className="px-8 py-3 text-base">
            <Save className="w-4 h-4" /> Salvar Todas as Configurações
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={() => {
              if (confirm('Tem certeza que deseja zerar todos os registros de barbeiros, serviços, clientes e agendamentos?')) {
                mockStore.clearAllData();
                window.location.reload();
              }
            }}
            className="text-xs py-2.5"
          >
            Zerar Registros (Começar do Zero)
          </Button>
        </div>
      </form>

      {/* Holiday Modal */}
      <Modal isOpen={isHolidayModalOpen} onClose={() => setIsHolidayModalOpen(false)} title="Cadastrar Feriado ou Dia Especial">
        <form onSubmit={handleAddHoliday} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Nome do Feriado / Data</label>
            <input
              type="text"
              value={holidayTitle}
              onChange={(e) => setHolidayTitle(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
              placeholder="Ex: Feriado de Independência"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Data</label>
            <input
              type="date"
              value={holidayDate}
              onChange={(e) => setHolidayDate(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm font-mono"
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center space-x-2 text-sm text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={holidayIsClosed}
                onChange={(e) => setHolidayIsClosed(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500"
              />
              <span className="font-medium">Barbearia estará totalmente Fechada neste dia</span>
            </label>

            {!holidayIsClosed && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Abre às</label>
                  <input
                    type="time"
                    value={holidayOpenTime}
                    onChange={(e) => setHolidayOpenTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Fecha às</label>
                  <input
                    type="time"
                    value={holidayCloseTime}
                    onChange={(e) => setHolidayCloseTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <Button type="submit" variant="gold" className="w-full py-3 mt-4">
            Salvar Feriado
          </Button>
        </form>
      </Modal>
    </div>
  );
}
