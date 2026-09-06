'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scissors, ShieldCheck, UserCheck, Key, ArrowRight, CheckCircle2, Eye, EyeOff, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { mockStore } from '@/lib/store/mockStore';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('dono@barbeariaimperial.com');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const account = mockStore.getAccount();
      // Só valida credenciais se o dono já criou uma senha no cadastro.
      if (account) {
        const result = mockStore.authenticate(email, password);
        if (!result.success) {
          setError(result.message || 'Não foi possível entrar.');
          return;
        }
      }
      router.push('/dashboard');
    }, 600);
  };

  const quickDemoAccess = (role: 'OWNER' | 'BARBER' | 'ADMIN') => {
    setIsLoading(true);
    setTimeout(() => {
      if (role === 'ADMIN') {
        router.push('/admin');
      } else if (role === 'BARBER') {
        router.push('/dashboard/agenda');
      } else {
        router.push('/dashboard');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-slate-950 text-slate-100 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Scissors className="w-7 h-7 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight">
              Barber<span className="gold-gradient-text">Flow</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Acessar Painel BarberFlow</h1>
          <p className="text-sm text-slate-400 mt-1">Entre com suas credenciais ou use o acesso de teste rápido</p>
        </div>

        {/* Quick Demo Selector */}
        <div className="glass-panel p-4 rounded-xl mb-6 border border-amber-500/30">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Acesso Rápido para Demonstração:
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => quickDemoAccess('OWNER')}
              className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700 text-slate-200 transition-colors text-center font-medium"
            >
              Dono / Gerente
            </button>
            <button
              onClick={() => quickDemoAccess('BARBER')}
              className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700 text-slate-200 transition-colors text-center font-medium"
            >
              Barbeiro
            </button>
            <button
              onClick={() => quickDemoAccess('ADMIN')}
              className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-purple-500/20 hover:text-purple-300 border border-slate-700 text-slate-200 transition-colors text-center font-medium"
            >
              Super Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Senha</label>
              <a href="#" className="text-xs text-amber-400 hover:underline">Esqueceu a senha?</a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 pr-12 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm"
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
          </div>

          {error && (
            <p className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <XCircle className="w-4 h-4 shrink-0" /> {error}
            </p>
          )}

          <Button type="submit" variant="gold" className="w-full text-base py-3" isLoading={isLoading}>
            Entrar no Sistema <ArrowRight className="w-4 h-4 ml-1" />
          </Button>

          <div className="pt-4 text-center text-xs text-slate-400 border-t border-slate-800">
            Ainda não tem uma conta?{' '}
            <Link href="/onboarding" className="text-amber-400 hover:underline font-semibold">
              Cadastre sua Barbearia
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
