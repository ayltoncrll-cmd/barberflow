'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scissors, CheckCircle2, ArrowRight, Building, Phone, MapPin, Clock, Sparkles, Lock, Eye, EyeOff, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { mockStore } from '@/lib/store/mockStore';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: 'Barbearia Vintage',
    ownerName: 'Ricardo Santos',
    phone: '(11) 99888-7766',
    email: 'contato@barbeariavintage.com',
    password: '',
    confirmPassword: '',
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

  const passwordRules = [
    { label: 'Mínimo de 8 caracteres', valid: formData.password.length >= 8 },
    { label: 'Uma letra maiúscula', valid: /[A-Z]/.test(formData.password) },
    { label: 'Uma letra minúscula', valid: /[a-z]/.test(formData.password) },
    { label: 'Um número', valid: /[0-9]/.test(formData.password) },
  ];

  const passwordScore = passwordRules.filter((r) => r.valid).length;
  const isPasswordValid = passwordScore === passwordRules.length;
  const passwordsMatch = formData.password.length > 0 && formData.password === formData.confirmPassword;

  const strengthLabel = ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'][passwordScore];
  const strengthColor = ['bg-slate-700', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'][passwordScore];
  const strengthTextColor = ['text-slate-500', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-emerald-400'][passwordScore];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!isPasswordValid) {
        setError('Sua senha ainda não atende a todos os requisitos de segurança.');
        return;
      }
      if (!passwordsMatch) {
        setError('As senhas não conferem. Digite a mesma senha nos dois campos.');
        return;
      }
      setStep(2);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      mockStore.saveAccount({
        email: formData.email,
        password: formData.password,
        ownerName: formData.ownerName,
      });
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

              <div className="pt-2 border-t border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  <Lock className="w-4 h-4" /> Crie sua senha de acesso
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Senha</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      autoComplete="new-password"
                      className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-amber-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {formData.password && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                            style={{ width: `${(passwordScore / passwordRules.length) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${strengthTextColor}`}>{strengthLabel}</span>
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {passwordRules.map((rule) => (
                          <li
                            key={rule.label}
                            className={`flex items-center gap-1.5 text-xs ${rule.valid ? 'text-emerald-400' : 'text-slate-500'}`}
                          >
                            {rule.valid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            {rule.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Confirmar Senha</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      autoComplete="new-password"
                      className={`w-full pl-11 pr-12 py-3 rounded-xl bg-slate-900/90 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 text-sm ${
                        formData.confirmPassword && !passwordsMatch
                          ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500'
                          : 'border-slate-800 focus:border-amber-500 focus:ring-amber-500'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-amber-400 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && (
                    <p className={`mt-2 flex items-center gap-1.5 text-xs ${passwordsMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                      {passwordsMatch ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {passwordsMatch ? 'As senhas conferem' : 'As senhas não conferem'}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <p className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                  <XCircle className="w-4 h-4 shrink-0" /> {error}
                </p>
              )}
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
