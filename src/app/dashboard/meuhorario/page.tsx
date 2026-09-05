'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Lock, MessageSquare, Copy, Check, Share2, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { mockStore } from '@/lib/store/mockStore';
import { mockBarbershop } from '@/lib/store/mockData';
import { ScheduleBlock, Professional } from '@/types';

export default function MeuHorarioPage() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Horário vago generator states
  const [vagoProfName, setVagoProfName] = useState('João Silva');
  const [vagoTime, setVagoTime] = useState('16:00');
  const [vagoService, setVagoService] = useState('Corte Tradicional');

  // Block modal states
  const [blockTitle, setBlockTitle] = useState('Intervalo de Almoço');
  const [blockProfId, setBlockProfId] = useState('');
  const [blockStartTime, setBlockStartTime] = useState('12:00');
  const [blockEndTime, setBlockEndTime] = useState('13:00');
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setBlocks(mockStore.getScheduleBlocks());
    const profs = mockStore.getProfessionals();
    setProfessionals(profs);
    if (profs.length > 0 && !blockProfId) {
      setBlockProfId(profs[0].id);
    }
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const todayISO = new Date().toISOString().split('T')[0];
    mockStore.addScheduleBlock({
      barbershopId: mockBarbershop.id,
      professionalId: blockProfId,
      title: blockTitle,
      startTime: `${todayISO}T${blockStartTime}:00`,
      endTime: `${todayISO}T${blockEndTime}:00`,
      reason: blockReason,
    });
    refreshData();
    setIsModalOpen(false);
  };

  const generatedVacantMessage = `💈 Abriu um horário hoje às ${vagoTime} com ${vagoProfName} para ${vagoService} na ${mockBarbershop.name}! ✂️\n\nGaranta sua vaga agora mesmo agendando pelo link:\nhttps://barberflow.com/barbearia/${mockBarbershop.slug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedVacantMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsAppShare = () => {
    const encoded = encodeURIComponent(generatedVacantMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-400" /> Bloqueio de Horários & Horário Vago
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Bloqueie horários para descanso/médico e crie avisos instantâneos de Horário Vago para o WhatsApp.
          </p>
        </div>
        <Button variant="gold" onClick={() => setIsModalOpen(true)}>
          <Lock className="w-4 h-4" /> Novo Bloqueio
        </Button>
      </div>

      {/* HORÁRIO VAGO GENERATOR CARD */}
      <div className="glass-panel p-6 rounded-2xl border-2 border-amber-500/40 relative overflow-hidden space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Gerador de Mensagem "Horário Vago" <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-400">Teve um cancelamento ou horário vago? Gere um texto pronto para compartilhar nas redes sociais.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Barbeiro Livre</label>
            <select
              value={vagoProfName}
              onChange={(e) => setVagoProfName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
            >
              {professionals.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Horário Disponível</label>
            <input
              type="time"
              value={vagoTime}
              onChange={(e) => setVagoTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Serviço Recomendado</label>
            <input
              type="text"
              value={vagoService}
              onChange={(e) => setVagoService(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
            />
          </div>
        </div>

        {/* Message Box Preview */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 relative">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mensagem Formatada Pronta:</div>
          <pre className="text-sm text-amber-300 font-sans whitespace-pre-wrap leading-relaxed">
            {generatedVacantMessage}
          </pre>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="gold" size="sm" onClick={copyToClipboard}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado para Área de Transferência!' : 'Copiar Texto'}
            </Button>
            <Button variant="outline" size="sm" onClick={openWhatsAppShare}>
              <Share2 className="w-4 h-4" /> Compartilhar via WhatsApp
            </Button>
          </div>
        </div>
      </div>

      {/* SCHEDULE BLOCKS LIST */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-amber-400" /> Horários Bloqueados / Folgas Cadastradas
        </h2>

        {blocks.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            Nenhum bloqueio cadastrado.
          </div>
        ) : (
          <div className="space-y-3">
            {blocks.map((block) => (
              <div key={block.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white text-sm">{block.title}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Horário: <span className="font-mono text-amber-400 font-bold">{new Date(block.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} às {new Date(block.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-semibold">
                  Bloqueado
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Block Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Cadastrar Bloqueio de Horário">
        <form onSubmit={handleAddBlock} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Título do Bloqueio</label>
            <input
              type="text"
              value={blockTitle}
              onChange={(e) => setBlockTitle(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
              placeholder="Ex: Consulta médica / Intervalo"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Hora Início</label>
              <input
                type="time"
                value={blockStartTime}
                onChange={(e) => setBlockStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Hora Fim</label>
              <input
                type="time"
                value={blockEndTime}
                onChange={(e) => setBlockEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm"
              />
            </div>
          </div>

          <Button type="submit" variant="gold" className="w-full text-sm py-2.5 mt-2">
            Confirmar Bloqueio
          </Button>
        </form>
      </Modal>
    </div>
  );
}
