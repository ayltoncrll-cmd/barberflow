'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Scissors, 
  Users, 
  UserCheck, 
  DollarSign, 
  Clock, 
  Settings, 
  ExternalLink,
  Menu,
  X,
  LogOut,
  Sparkles,
  Award
} from 'lucide-react';
import { mockBarbershop } from '@/lib/store/mockData';

const navItems = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/dashboard/agenda', label: 'Agenda Digital', icon: Calendar },
  { href: '/dashboard/servicos', label: 'Serviços', icon: Scissors },
  { href: '/dashboard/profissionais', label: 'Profissionais', icon: UserCheck },
  { href: '/dashboard/clientes', label: 'Clientes & Fidelidade', icon: Users },
  { href: '/dashboard/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/dashboard/meuhorario', label: 'Bloqueios & Horário Vago', icon: Clock },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800 bg-slate-900/60 backdrop-blur-xl shrink-0 fixed inset-y-0 z-30">
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Scissors className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-lg leading-tight">BarberFlow</span>
              <span className="text-[10px] text-amber-400 font-mono font-semibold uppercase tracking-wider">{mockBarbershop.name}</span>
            </div>
          </Link>
        </div>

        {/* Public Booking Link Badge */}
        <div className="px-4 py-3 border-b border-slate-800/60 bg-amber-500/5">
          <a
            href={`/barbearia/${mockBarbershop.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-400 text-xs font-semibold transition-colors group"
          >
            <span className="truncate">Página de Agendamento</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
              RI
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">Roberto Imperial</div>
              <div className="text-[10px] text-slate-400 truncate">Dono / Gerente</div>
            </div>
          </div>
          <Link href="/login" className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors" title="Sair">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <span className="font-bold text-white text-lg">BarberFlow</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                        isActive ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <a
              href={`/barbearia/${mockBarbershop.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold text-center text-xs flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" /> Ver Agendamento do Cliente
            </a>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* MOBILE HEADER */}
        <header className="lg:hidden h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-300">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-amber-400 text-sm">{mockBarbershop.name}</span>
          <a href={`/barbearia/${mockBarbershop.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400">
            <ExternalLink className="w-5 h-5" />
          </a>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
