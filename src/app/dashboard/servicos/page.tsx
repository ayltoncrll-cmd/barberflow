'use client';

import React, { useState, useEffect } from 'react';
import { Scissors, Plus, Clock, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { mockStore } from '@/lib/store/mockStore';
import { formatCurrency } from '@/lib/utils/formatters';
import { Service } from '@/types';

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('40.00');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [active, setActive] = useState(true);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setServices(mockStore.getServices());
  };

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setName(service.name);
      setDescription(service.description || '');
      setPrice(service.price.toString());
      setDurationMinutes(service.durationMinutes.toString());
      setActive(service.active);
    } else {
      setEditingService(null);
      setName('');
      setDescription('');
      setPrice('40.00');
      setDurationMinutes('30');
      setActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      mockStore.updateService(editingService.id, {
        name,
        description,
        price: parseFloat(price),
        durationMinutes: parseInt(durationMinutes, 10),
        active,
      });
    } else {
      mockStore.addService({
        barbershopId: 'b1111111-1111-1111-1111-111111111111',
        name,
        description,
        price: parseFloat(price),
        durationMinutes: parseInt(durationMinutes, 10),
        active,
      });
    }
    refreshData();
    setIsModalOpen(false);
  };

  const toggleStatus = (service: Service) => {
    mockStore.updateService(service.id, { active: !service.active });
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Scissors className="w-6 h-6 text-amber-400" /> Catálogo de Serviços
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Cadastre os preços, durações e descrições dos serviços oferecidos na sua barbearia.
          </p>
        </div>
        <Button variant="gold" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" /> Novo Serviço
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className={`glass-card p-6 rounded-2xl border transition-all flex flex-col justify-between ${
              service.active ? 'border-slate-800 hover:border-amber-500/40' : 'border-red-900/30 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {service.name}
                  </h3>
                  <Badge variant={service.active ? 'emerald' : 'red'} className="mt-1">
                    {service.active ? 'Ativo no Cardápio' : 'Inativo'}
                  </Badge>
                </div>
                <div className="text-xl font-extrabold text-amber-400 font-mono">
                  {formatCurrency(service.price)}
                </div>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                {service.description || 'Sem descrição cadastrada.'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center text-xs text-slate-300 font-semibold gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Duração: {service.durationMinutes} minutos</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleStatus(service)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
                >
                  {service.active ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => handleOpenModal(service)}
                  className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
                  title="Editar Serviço"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Nome do Serviço</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
              placeholder="Ex: Corte Tradicional"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Descrição Detalhada</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
              placeholder="O que está incluso no serviço?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Duração (Minutos)</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
              >
                <option value="15">15 minutos</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">60 minutos (1 hora)</option>
                <option value="90">90 minutos (1h 30m)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="activeSwitch"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-amber-500 focus:ring-amber-500"
            />
            <label htmlFor="activeSwitch" className="text-sm font-medium text-slate-200">
              Serviço Ativo e disponível para agendamento online
            </label>
          </div>

          <Button type="submit" variant="gold" className="w-full text-sm py-3 mt-4">
            {editingService ? 'Salvar Alterações' : 'Cadastrar Serviço'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
