'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scissors, CheckCircle2, ArrowRight, Building, Phone, MapPin, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { mockStore } from '@/lib/store/mockStore';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: 'Barbearia Vintage',
    ownerName: 'Ricardo Santos',
    phone: '(11) 99888-7766',
    email: 'contato@barbeariavintage.com',
    city: 'São Paulo',
    state: 'SP',
    address: 'Rua Augusta, 500 - Consolação',
    openTime: '08:00',
    closeTime: '20:00',
  });

  const slug = formData.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      mockStore.updateBarbershop({
        name: formData.name,
        slug: slug || 'minha-barbearia',
        phone: formData.phone,
        whatsapp: formData.phone,
        email: formData.email,
        city: formData.city,
        state: formData.state,
        address: formData.address,
      });
      setIsLoading(false);
      router.push('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-slate-950 text-slate-100 py-12 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Scissors className="w-7 h-7 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight">
              Barber<span className="gold-gradient-text">Flow</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Cadastre sua Barbearia no BarberFlow</h1>
          <p className="text-sm text-slate-400 mt-1">Configure sua conta em menos de 2 minutos</p>
        </div>

        {/* Stepper Header */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className={`flex items-center space-x-2 text-sm font-semibold ${step >= 1 ? 'text-amber-400' : 'text-slate-500'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800'}`}>1</span>
            <span>Dados da Barbearia</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-800" />
          <div className={`flex items-center space-x-2 text-sm font-semibold ${step >= 2 ? 'text-amber-400' : 'text-slate-500'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800'}`}>2</span>
            <span>Localização & Horários</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          {step === 1 ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Nome da Barbearia</label>
                <div className="relative">
                  <Building className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                    placeholder="Ex: Barbearia do João"
                  />
                </div>
                {formData.name && (
                  <p className="mt-2 text-xs text-amber-400/90 font-mono">
                    Seu link público de agendamento será: <br />
                    <span className="text-white bg-slate-900 px-2 py-1 rounded border border-slate-800 inline-block mt-1">
                      /barbearia/{slug || 'nome-da-barbearia'}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Nome do Responsável</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                    placeholder="(11) 99999-8888"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">E-mail Comercial</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                    placeholder="contato@barbearia.com"
                  />
                </div>
              </div>

              <Button type="submit" variant="gold" className="w-full text-base py-3">
                Próximo Passo <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Cidade</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">UF</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    required
                    maxLength={2}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-sm text-center uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Endereço Completo</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-sm"
                  placeholder="Rua, número e bairro"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Horário Abertura</label>
                  <input
                    type="time"
                    value={formData.openTime}
                    onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Horário Fechamento</label>
                  <input
                    type="time"
                    value={formData.closeTime}
                    onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="secondary" onClick={() => setStep(1)} className="w-1/3">
                  Voltar
                </Button>
                <Button type="submit" variant="gold" isLoading={isLoading} className="w-2/3">
                  Concluir Cadastro <Sparkles className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
