'use client';

import React, { useState, useEffect } from 'react';
import { SAVTicket, SAVStatus, BaserowConfig } from '@/types/sav';
import {
  getTickets,
  saveOrUpdateTicket,
  deleteTicket,
  getBaserowConfig,
  saveBaserowConfig,
  syncAllPendingTickets,
  pullAndMergeBaserowTickets,
} from '@/services/storage';
import { syncTicketWithBaserow, fetchServerBaserowStatus } from '@/services/baserow';
import Header from '@/components/Header';
import IntakeForm from '@/components/IntakeForm';
import Dashboard from '@/components/Dashboard';
import BaserowSettings from '@/components/BaserowSettings';
import PrintableTicket from '@/components/PrintableTicket';
import LoginGate from '@/components/LoginGate';
import { Edit3, X, DollarSign } from 'lucide-react';

export default function Home() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);

  const [activeTab, setActiveTab] = useState<'intake' | 'dashboard' | 'settings'>('dashboard');
  const [tickets, setTickets] = useState<SAVTicket[]>([]);
  const [baserowConfig, setBaserowConfig] = useState<BaserowConfig>({
    apiUrl: '',
    databaseToken: '',
    tableId: '',
    autoSyncOnSave: true,
    userFieldNames: true,
  });
  const [serverBaserowConfigured, setServerBaserowConfigured] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [printModalTicket, setPrintModalTicket] = useState<SAVTicket | null>(null);
  const [editingDiagnosticTicket, setEditingDiagnosticTicket] = useState<SAVTicket | null>(null);

  // Form states for Diagnostic Edit Modal
  const [diagFindings, setDiagFindings] = useState('');
  const [diagParts, setDiagParts] = useState('');
  const [diagCost, setDiagCost] = useState<number | ''>('');
  const [diagStatus, setDiagStatus] = useState<SAVStatus>('reparation');

  const loadAppData = async () => {
    setTickets(getTickets());
    setBaserowConfig(getBaserowConfig());

    const serverStatus = await fetchServerBaserowStatus();
    setServerBaserowConfigured(serverStatus.configured);

    if (serverStatus.configured) {
      setIsSyncing(true);
      try {
        const merged = await pullAndMergeBaserowTickets();
        setTickets(merged.tickets);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Check auth on mount, then load data
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/auth', { cache: 'no-store' });
        const data = await res.json();
        setAuthRequired(Boolean(data.authRequired));
        setAuthenticated(Boolean(data.authenticated));
        setAuthChecked(true);
        if (data.authenticated) {
          await loadAppData();
        }
      } catch {
        setAuthChecked(true);
        setAuthenticated(true);
        await loadAppData();
      }
    };
    init();
  }, []);

  const refreshData = () => {
    setTickets(getTickets());
  };

  const handleRefreshFromBaserow = async () => {
    setIsSyncing(true);
    try {
      await syncAllPendingTickets();
      const merged = await pullAndMergeBaserowTickets();
      setTickets(merged.tickets);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setAuthenticated(false);
  };

  const pendingCount = tickets.filter((t) => t.baserowSyncStatus !== 'synced').length;

  // Handlers
  const handleTicketCreated = (newTicket: SAVTicket, shouldPrint = false) => {
    refreshData();
    if (shouldPrint) {
      setPrintModalTicket(newTicket);
    }
    setActiveTab('dashboard');
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: SAVStatus) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const updated: SAVTicket = {
      ...ticket,
      statut: newStatus,
      derniereModification: new Date().toISOString(),
    };

    await saveOrUpdateTicket(updated);
    refreshData();
  };

  const handleDeleteTicket = (ticketId: string) => {
    deleteTicket(ticketId);
    refreshData();
  };

  const handleSyncTicket = async (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const res = await syncTicketWithBaserow(ticket, baserowConfig);
    if (res.success && res.rowId) {
      ticket.baserowRowId = res.rowId;
      ticket.baserowSyncStatus = 'synced';
      ticket.baserowSyncDate = new Date().toISOString();
      delete ticket.baserowSyncError;
      await saveOrUpdateTicket(ticket);
      refreshData();
    } else {
      alert(`Erreur de synchronisation : ${res.error}`);
    }
  };

  const handleSaveBaserowConfig = (newConfig: BaserowConfig) => {
    saveBaserowConfig(newConfig);
    setBaserowConfig(newConfig);
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      const res = await syncAllPendingTickets();
      refreshData();
      return res;
    } finally {
      setIsSyncing(false);
    }
  };

  // Open Edit Diagnostic Modal
  const handleOpenDiagnosticModal = (ticket: SAVTicket) => {
    setEditingDiagnosticTicket(ticket);
    setDiagFindings(ticket.rapportTechnique?.diagnosticTechnicien || '');
    setDiagParts(ticket.rapportTechnique?.piecesRemplacees || '');
    setDiagCost(ticket.rapportTechnique?.montantTotalTTC ?? '');
    setDiagStatus(ticket.statut);
  };

  const handleSaveDiagnostic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDiagnosticTicket) return;

    const updated: SAVTicket = {
      ...editingDiagnosticTicket,
      statut: diagStatus,
      derniereModification: new Date().toISOString(),
      rapportTechnique: {
        ...(editingDiagnosticTicket.rapportTechnique || {}),
        diagnosticTechnicien: diagFindings,
        piecesRemplacees: diagParts,
        montantTotalTTC: diagCost === '' ? undefined : Number(diagCost),
      },
    };

    await saveOrUpdateTicket(updated);
    setEditingDiagnosticTicket(null);
    refreshData();
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dunkirk-dark text-slate-400 text-sm">
        Chargement...
      </div>
    );
  }

  if (authRequired && !authenticated) {
    return (
      <LoginGate
        onSuccess={async () => {
          setAuthenticated(true);
          await loadAppData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        baserowConfig={baserowConfig}
        serverBaserowConfigured={serverBaserowConfigured}
        pendingSyncCount={pendingCount}
        onSyncAll={handleSyncAll}
        onRefreshFromBaserow={handleRefreshFromBaserow}
        isSyncing={isSyncing}
        authRequired={authRequired}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'intake' && (
          <IntakeForm
            onTicketCreated={handleTicketCreated}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            tickets={tickets}
            onSelectTicket={(ticket) => setPrintModalTicket(ticket)}
            onPrintTicket={(ticket) => setPrintModalTicket(ticket)}
            onUpdateStatus={handleUpdateStatus}
            onDeleteTicket={handleDeleteTicket}
            onSyncTicket={handleSyncTicket}
            onEditTicketDiagnostic={handleOpenDiagnosticModal}
            onNewTicketClick={() => setActiveTab('intake')}
          />
        )}

        {activeTab === 'settings' && (
          <BaserowSettings
            config={baserowConfig}
            serverConfigured={serverBaserowConfigured}
            onSaveConfig={handleSaveBaserowConfig}
            onSyncAll={handleSyncAll}
            pendingCount={pendingCount}
          />
        )}
      </main>

      {/* A4 Printable Modal */}
      {printModalTicket && (
        <PrintableTicket
          ticket={printModalTicket}
          onClose={() => setPrintModalTicket(null)}
        />
      )}

      {/* Diagnostic & Technical Report Modal */}
      {editingDiagnosticTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  Rapport Technique & Facturation
                </h3>
                <p className="text-xs text-slate-400">
                  Dossier #{editingDiagnosticTicket.id} • {editingDiagnosticTicket.client.nom} {editingDiagnosticTicket.client.prenom}
                </p>
              </div>
              <button
                onClick={() => setEditingDiagnosticTicket(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDiagnostic} className="space-y-4">
              {/* Statut */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Statut du dossier
                </label>
                <select
                  value={diagStatus}
                  onChange={(e) => setDiagStatus(e.target.value as SAVStatus)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="depose">Matériel Déposé</option>
                  <option value="diagnostic">Diagnostic en cours</option>
                  <option value="devis_attente">En attente accord devis</option>
                  <option value="pieces_commandees">Pièces commandées</option>
                  <option value="reparation">Réparation en cours</option>
                  <option value="tests">Tests & Contrôles</option>
                  <option value="pret">Prêt à être restitué</option>
                  <option value="restitue">Restitué au client</option>
                </select>
              </div>

              {/* Diagnostic / Constatations */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Observations & Diagnostic technique
                </label>
                <textarea
                  rows={3}
                  value={diagFindings}
                  onChange={(e) => setDiagFindings(e.target.value)}
                  placeholder="Ex: Disque dur mécanique HS remplacé par SSD 500 Go, réinstallation propre Windows 11 + pilotes..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Pièces changées */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Pièces remplacées
                </label>
                <input
                  type="text"
                  value={diagParts}
                  onChange={(e) => setDiagParts(e.target.value)}
                  placeholder="SSD Crucial 500 Go, Pâte thermique MX-4, Chargeur 65W..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Coût total */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  Montant Total TTC de l&apos;intervention (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={diagCost}
                  onChange={(e) => setDiagCost(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ex: 89"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingDiagnosticTicket(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 print:hidden">
        <p>
          Dunkirk Informatique • Application SAV & Atelier • Dunkerque & Flandres • 03 39 91 26 59 • contact@dunkirkinformatique.fr
        </p>
      </footer>
    </div>
  );
}
