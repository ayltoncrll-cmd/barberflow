'use client';

import React, { useState, useEffect } from 'react';
import { Users, Award, Search, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { mockStore } from '@/lib/store/mockStore';
import { formatCurrency, formatDateBR } from '@/lib/utils/formatters';
import { Customer } from '@/types';

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setCustomers(mockStore.getCustomers());
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      mockStore.deleteCustomer(id);
      refreshData();
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const loyaltyProg = mockStore.getLoyaltyProgram();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" /> CRM de Clientes & Programa de Fidelidade
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Histórico completo de visitas, faturamento por cliente e cartão de fidelidade digital.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Fidelidade: {loyaltyProg.requiredStamps} visitas = {loyaltyProg.rewardDescription}</span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Customers Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center text-slate-400 text-sm">
          Nenhum cliente cadastrado. Novos clientes serão adicionados automaticamente ao realizarem agendamentos.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => {
            const stamps = customer.stampsCount || 0;
            const targetStamps = loyaltyProg.requiredStamps;
            const progressPercent = Math.min(100, Math.round((stamps / targetStamps) * 100));

            return (
              <div
                key={customer.id}
                className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all space-y-4 relative group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-lg">{customer.name}</h3>
                    <div className="text-xs text-amber-400 font-mono mt-0.5">{customer.phone}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="gold" className="font-bold font-mono">
                      {customer.totalVisits} visitas
                    </Badge>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      title="Excluir Cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {customer.notes && (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 italic">
                    "{customer.notes}"
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Total Gasto</span>
                    <span className="text-white font-bold text-sm">{formatCurrency(customer.totalSpent)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Última Visita</span>
                    <span className="text-slate-200 font-medium">{formatDateBR(customer.lastVisitAt)}</span>
                  </div>
                </div>

                {/* Loyalty Stamp Progress */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-400" /> Cartão Fidelidade
                    </span>
                    <span className="text-amber-400 font-bold font-mono">
                      {stamps} / {targetStamps} selos
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  {stamps >= targetStamps && (
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center">
                      ★ Recompensa Disponível para Resgate!
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
