'use client';

import React, { useState, useMemo } from 'react';
import { SAVTicket, SAVStatus, STATUS_CONFIG, DEVICE_CATEGORIES } from '@/types/sav';
import {
  Search,
  Printer,
  Edit3,
  RefreshCw,
  Trash2,
  Clock,
  Filter,
  Laptop,
  Smartphone,
  Server,
  HardDrive,
  Cpu,
} from 'lucide-react';

interface DashboardProps {
  tickets: SAVTicket[];
  onSelectTicket: (ticket: SAVTicket) => void;
  onPrintTicket: (ticket: SAVTicket) => void;
  onUpdateStatus: (ticketId: string, newStatus: SAVStatus) => void;
  onDeleteTicket: (ticketId: string) => void;
  onSyncTicket: (ticketId: string) => Promise<void>;
  onEditTicketDiagnostic: (ticket: SAVTicket) => void;
  onNewTicketClick: () => void;
}

export default function Dashboard({
  tickets,
  onSelectTicket,
  onPrintTicket,
  onUpdateStatus,
  onDeleteTicket,
  onSyncTicket,
  onEditTicketDiagnostic,
  onNewTicketClick,
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.client.telephone.includes(searchTerm) ||
        t.materiel.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.materiel.modele.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || t.statut === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: tickets.length,
      depose: tickets.filter((t) => t.statut === 'depose').length,
      enCours: tickets.filter((t) => ['diagnostic', 'devis_attente', 'pieces_commandees', 'reparation', 'tests'].includes(t.statut)).length,
      pret: tickets.filter((t) => t.statut === 'pret').length,
      restitue: tickets.filter((t) => t.statut === 'restitue').length,
    };
  }, [tickets]);

  const handleSyncClick = async (e: React.MouseEvent, ticketId: string) => {
    e.stopPropagation();
    setSyncingId(ticketId);
    try {
      await onSyncTicket(ticketId);
    } finally {
      setSyncingId(null);
    }
  };

  const getDeviceIcon = (category: string) => {
    switch (category) {
      case 'pc_portable':
      case 'macbook':
        return <Laptop className="w-4 h-4 text-amber-400" />;
      case 'smartphone_tablette':
        return <Smartphone className="w-4 h-4 text-sky-400" />;
      case 'serveur':
        return <Server className="w-4 h-4 text-emerald-400" />;
      case 'disque_dur':
        return <HardDrive className="w-4 h-4 text-purple-400" />;
      default:
        return <Cpu className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div
          onClick={() => setStatusFilter('all')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            statusFilter === 'all'
              ? 'bg-[#0B2244]/80 border-amber-400 shadow-lg shadow-amber-500/10'
              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-slate-400 text-xs font-medium">Total Dossiers</div>
          <div className="text-2xl font-black text-white mt-1">{stats.total}</div>
        </div>

        <div
          onClick={() => setStatusFilter('depose')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            statusFilter === 'depose'
              ? 'bg-amber-950/40 border-amber-400'
              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-amber-400 text-xs font-medium">À Diagnostiquer</div>
          <div className="text-2xl font-black text-amber-300 mt-1">{stats.depose}</div>
        </div>

        <div
          onClick={() => setStatusFilter('reparation')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            statusFilter === 'reparation'
              ? 'bg-blue-950/40 border-blue-400'
              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-blue-400 text-xs font-medium">En Intervention</div>
          <div className="text-2xl font-black text-blue-300 mt-1">{stats.enCours}</div>
        </div>

        <div
          onClick={() => setStatusFilter('pret')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            statusFilter === 'pret'
              ? 'bg-emerald-950/40 border-emerald-400'
              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-emerald-400 text-xs font-medium">Prêt pour Client</div>
          <div className="text-2xl font-black text-emerald-300 mt-1">{stats.pret}</div>
        </div>

        <div
          onClick={() => setStatusFilter('restitue')}
          className={`cursor-pointer p-4 rounded-xl border transition-all col-span-2 md:col-span-1 ${
            statusFilter === 'restitue'
              ? 'bg-slate-800/80 border-slate-400'
              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-slate-400 text-xs font-medium">Restitués / Clôturés</div>
          <div className="text-2xl font-black text-slate-300 mt-1">{stats.restitue}</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par N° dossier, nom, téléphone, modèle..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Filter select & New intake button */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">Tous les états</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key} className="bg-slate-900 text-slate-200">
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onNewTicketClick}
            className="whitespace-nowrap px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all"
          >
            + Nouvelle Prise en Charge
          </button>
        </div>
      </div>

      {/* Tickets List / Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-slate-300 font-semibold text-base">Aucun dossier trouvé</h3>
            <p className="text-slate-500 text-xs mt-1">
              Modifiez votre recherche ou enregistrez une nouvelle prise en charge.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">N° Dossier</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Matériel</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4">Synchro Baserow</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredTickets.map((ticket) => {
                  const status = STATUS_CONFIG[ticket.statut] || STATUS_CONFIG['depose'];
                  const isSyncing = syncingId === ticket.id;

                  return (
                    <tr
                      key={ticket.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      onClick={() => onSelectTicket(ticket)}
                    >
                      {/* Ticket Number & Date */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-amber-400 group-hover:underline">
                          {ticket.id}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(ticket.dateDepot).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">
                          {ticket.client.nom} {ticket.client.prenom}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {ticket.client.telephone}
                        </div>
                      </td>

                      {/* Device */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-200">
                          {getDeviceIcon(ticket.materiel.categorie)}
                          <span>
                            {ticket.materiel.marque} {ticket.materiel.modele}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                          {ticket.demandeClient.descriptionPanne}
                        </div>
                      </td>

                      {/* Status Selector */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={ticket.statut}
                          onChange={(e) =>
                            onUpdateStatus(ticket.id, e.target.value as SAVStatus)
                          }
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer focus:outline-none ${status.bg} ${status.color} ${status.border}`}
                        >
                          {Object.entries(STATUS_CONFIG).map(([k, cfg]) => (
                            <option key={k} value={k} className="bg-slate-900 text-slate-200">
                              {cfg.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Baserow Sync Status */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              ticket.baserowSyncStatus === 'synced'
                                ? 'bg-emerald-400'
                                : ticket.baserowSyncStatus === 'error'
                                ? 'bg-red-400'
                                : 'bg-amber-400 animate-pulse'
                            }`}
                          />
                          <span className="text-[11px] text-slate-400">
                            {ticket.baserowSyncStatus === 'synced'
                              ? 'Synchronisé'
                              : ticket.baserowSyncStatus === 'error'
                              ? 'Erreur'
                              : 'En attente'}
                          </span>
                          <button
                            title="Forcer la synchronisation avec Baserow"
                            disabled={isSyncing}
                            onClick={(e) => handleSyncClick(e, ticket.id)}
                            className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors disabled:opacity-50"
                          >
                            <RefreshCw
                              className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`}
                            />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Modifier le rapport d'intervention technique"
                            onClick={() => onEditTicketDiagnostic(ticket)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 rounded-lg transition-colors border border-slate-700"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Imprimer le Reçu & Fiche Atelier A4"
                            onClick={() => onPrintTicket(ticket)}
                            className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 rounded-lg transition-colors border border-amber-500/30"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Supprimer ce dossier"
                            onClick={() => {
                              if (
                                confirm(
                                  `Êtes-vous sûr de vouloir supprimer le dossier ${ticket.id} ?`
                                )
                              ) {
                                onDeleteTicket(ticket.id);
                              }
                            }}
                            className="p-1.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 rounded-lg transition-colors border border-red-800/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
