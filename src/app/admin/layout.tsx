'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  Building2,
  CreditCard,
  Package,
  Settings,
  KeyRound,
  LogOut,
  Loader2,
  Menu,
  X,
} from 'lucide-react';
import { mockStore, Session } from '@/lib/store/mockStore';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/barbearias', label: 'Barbearias', icon: Building2 },
  { href: '/admin/assinaturas', label: 'Assinaturas', icon: CreditCard },
  { href: '/admin/planos', label: 'Planos', icon: Package },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const current = mockStore.getSession();
    if (current?.role !== 'ADMIN') {
      router.replace('/login');
      return;
    }

    // Enquanto a senha padrão não for trocada, o admin fica preso na tela de troca.
    const admin = mockStore.getAdmin();
    if (admin.mustChangePassword && pathname !== '/admin/trocar-senha') {
      router.replace('/admin/trocar-senha');
      return;
    }

    setSession(current);
    setChecking(false);
  }, [router, pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    mockStore.clearSession();
    router.replace('/login');
  };

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-950 text-slate-400">
        <Loader2 className="w-7 h-7 animate-spin text-purple-400" />
        <span className="text-sm">Verificando permissões de administrador...</span>
      </div>
    );
  }

  // A troca de senha obrigatória aparece sem a navegação, para não dar saída.
  const isPasswordScreen = pathname === '/admin/trocar-senha';

  const sidebarContent = (
    <>
      <div className="p-5 border-b border-slate-800/80">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            <ShieldCheck className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-white text-base leading-tight">BarberFlow</span>
            <span className="text-[10px] text-purple-400 font-mono font-semibold uppercase tracking-wider">
              Administração
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-purple-500 text-white font-semibold shadow-lg shadow-purple-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white stroke-[2.5]' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800/80 space-y-1">
        <Link
          href="/admin/trocar-senha"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-purple-300 hover:bg-slate-800/60 transition-colors"
        >
          <KeyRound className="w-4 h-4" />
          <span>Trocar senha</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
        <div className="flex items-center gap-3 px-3.5 pt-3 mt-2 border-t border-slate-800/60">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs border border-purple-500/30 shrink-0">
            AD
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">{session?.name}</div>
            <div className="text-[10px] text-slate-500 truncate">{session?.email}</div>
          </div>
        </div>
      </div>
    </>
  );

  if (isPasswordScreen) {
    return <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>;
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white">
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800 bg-slate-900/60 backdrop-blur-xl shrink-0 fixed inset-y-0 z-30">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 p-1.5 text-slate-400 hover:text-white z-10"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="lg:hidden h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="p-2 text-slate-300" aria-label="Abrir menu">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-purple-400 text-sm flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Administração BarberFlow
          </span>
          <div className="w-10" />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
