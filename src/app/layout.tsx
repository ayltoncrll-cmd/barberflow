import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BarberFlow | SaaS de Gestão de Barbearias & Agendamento Online',
  description: 'Plataforma completa para gestão de barbearias, agendamento online 24h, relatórios financeiros, comissões e fidelização de clientes.',
  keywords: ['barbearia', 'agendamento online', 'saas barbearia', 'gestao de barbearia', 'barber flow'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-obsidian-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
