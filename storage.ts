import { SAVTicket, BaserowConfig } from '@/types/sav';
import { syncTicketWithBaserow, fetchTicketsFromBaserow } from './baserow';

const STORAGE_KEYS = {
  TICKETS: 'dunkirk_sav_tickets_v1',
  CONFIG: 'dunkirk_sav_baserow_config_v1',
  COUNTER: 'dunkirk_sav_counter_2026_v1'
};

export const DEFAULT_BASEROW_CONFIG: BaserowConfig = {
  apiUrl: '',
  databaseToken: '',
  tableId: '',
  autoSyncOnSave: true,
  userFieldNames: true
};

const SAMPLE_TICKETS: SAVTicket[] = [
  {
    id: 'DK-SAV-2026-0001',
    dateDepot: new Date(Date.now() - 86400000 * 2).toISOString(),
    derniereModification: new Date(Date.now() - 86400000 * 1).toISOString(),
    statut: 'reparation',
    client: {
      type: 'professionnel',
      nom: 'Vansteenkiste',
      prenom: 'Arnaud',
      societe: 'Flandres Logistique & Transit',
      siret: '849 203 112 00019',
      telephone: '06 12 34 56 78',
      email: 'arnaud@flandres-logistique.fr',
      adresse: '14 Quai des Armateurs',
      codePostal: '59140',
      ville: 'Dunkerque'
    },
    materiel: {
      categorie: 'pc_portable',
      marque: 'Lenovo',
      modele: 'ThinkPad T14 Gen 3',
      numeroSerie: 'PF-3B9K01',
      systemeExploitation: 'Windows 11 Pro',
      motDePasseSession: 'Flandres59!',
      aMotDePasse: true
    },
    accessoires: {
      chargeur: true,
      cableAlimentation: true,
      sacoche: true,
      souris: false,
      adaptateur: false,
      disqueExterne: false,
      cleUsb: false,
      boiteOrigine: false
    },
    etatVisuel: {
      rayuresChassis: true,
      chocsFissures: false,
      ecranRayures: false,
      ecranCasse: false,
      charnieresAbimees: false,
      visManquantes: false,
      tracesLiquide: false,
      touchesClavierManquantes: false,
      commentairesEtat: 'Rayures d’usage sur capot supérieur, écran impeccable.'
    },
    demandeClient: {
      descriptionPanne: 'Lenteurs extrêmes au démarrage et bruits anormaux de ventilation. Écran bleu intermittent (CRITICAL_PROCESS_DIED).',
      sauvegardeDonnees: 'indispensable',
      dossiersCruciaux: 'Dossier C:\\Compta_Flandres et Outlook .pst',
      dejaRepareAilleurs: false
    },
    conditions: {
      urgence: 'express',
      budgetMaxiSansDevis: 250,
      acompteVerse: 50,
      modePaiementAcompte: 'Carte Bancaire',
      delaiSouhaite: 'Avant vendredi 17h pour clôture trimestrielle',
      accepteConditions: true
    },
    rapportTechnique: {
      diagnosticTechnicien: 'SSD NVMe d’origine présentant 42% de blocs corrompus. Pâte thermique CPU asséchée.',
      actionsEffectuees: 'Clonage sécurisé secteur par secteur sur SSD Samsung 980 1To. Dépoussiérage et repasting Noctua.',
      piecesRemplacees: 'SSD M.2 NVMe Samsung 1To',
      tempsPasseHeures: 2.5,
      montantTotalTTC: 189,
      garantieMois: 12
    },
    technicienResponsable: 'Équipe Atelier Dunkirk',
    baserowSyncStatus: 'pending'
  },
  {
    id: 'DK-SAV-2026-0002',
    dateDepot: new Date(Date.now() - 86400000 * 4).toISOString(),
    derniereModification: new Date(Date.now() - 3600000 * 5).toISOString(),
    statut: 'pret',
    client: {
      type: 'particulier',
      nom: 'Dubois',
      prenom: 'Catherine',
      telephone: '06 98 76 54 32',
      email: 'catherine.dubois59@orange.fr',
      adresse: '8 Rue des Dunes',
      codePostal: '59240',
      ville: 'Dunkerque - Rosendaël'
    },
    materiel: {
      categorie: 'macbook',
      marque: 'Apple',
      modele: 'MacBook Air M1 13" (A2337)',
      numeroSerie: 'C02F83KLQ6L4',
      systemeExploitation: 'macOS Sonoma',
      motDePasseSession: 'Rosendael2024',
      aMotDePasse: true
    },
    accessoires: {
      chargeur: true,
      cableAlimentation: true,
      sacoche: false,
      souris: false,
      adaptateur: true,
      disqueExterne: false,
      cleUsb: false,
      boiteOrigine: false,
      autres: 'Adaptateur USB-C vers USB-A Apple'
    },
    etatVisuel: {
      rayuresChassis: false,
      chocsFissures: false,
      ecranRayures: false,
      ecranCasse: false,
      charnieresAbimees: false,
      visManquantes: false,
      tracesLiquide: false,
      touchesClavierManquantes: false,
      commentairesEtat: 'Matériel en excellent état cosmétique.'
    },
    demandeClient: {
      descriptionPanne: 'Ne charge plus que par intermittence, puis extinction complète sans redémarrage.',
      sauvegardeDonnees: 'souhaitable',
      dossiersCruciaux: 'Photos familiales et Bibliothèque Musique',
      dejaRepareAilleurs: false
    },
    conditions: {
      urgence: 'standard',
      budgetMaxiSansDevis: 150,
      acompteVerse: 0,
      delaiSouhaite: 'Dès que possible',
      accepteConditions: true
    },
    rapportTechnique: {
      diagnosticTechnicien: 'Connecteur USB-C MagSafe encrassé et fusible d’alimentation sur carte fille remplacé.',
      actionsEffectuees: 'Nettoyage ultra-sons du connecteur, remplacement carte fille USB-C, test cycle de batterie.',
      piecesRemplacees: 'Carte I/O USB-C MacBook Air',
      tempsPasseHeures: 1.5,
      montantTotalTTC: 99,
      garantieMois: 6
    },
    technicienResponsable: 'Équipe Atelier Dunkirk',
    baserowSyncStatus: 'synced',
    baserowRowId: 1042
  }
];

export function getBaserowConfig(): BaserowConfig {
  if (typeof window === 'undefined') return DEFAULT_BASEROW_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) return DEFAULT_BASEROW_CONFIG;
    return { ...DEFAULT_BASEROW_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_BASEROW_CONFIG;
  }
}

export function saveBaserowConfig(config: BaserowConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
}

export function getTickets(): SAVTicket[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TICKETS);
    if (!raw) {
      // Initialise avec les exemples
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(SAMPLE_TICKETS));
      return SAMPLE_TICKETS;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTickets(tickets: SAVTicket[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
}

export function generateNextTicketId(): string {
  if (typeof window === 'undefined') return 'DK-SAV-2026-0001';
  try {
    const currentCounter = parseInt(localStorage.getItem(STORAGE_KEYS.COUNTER) || '3', 10);
    const nextCounter = currentCounter + 1;
    localStorage.setItem(STORAGE_KEYS.COUNTER, nextCounter.toString());
    const padded = nextCounter.toString().padStart(4, '0');
    return `DK-SAV-2026-${padded}`;
  } catch {
    return `DK-SAV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  }
}

export async function saveOrUpdateTicket(ticket: SAVTicket): Promise<{ ticket: SAVTicket; syncResult?: { success: boolean; error?: string } }> {
  const tickets = getTickets();
  const existingIdx = tickets.findIndex(t => t.id === ticket.id);
  
  ticket.derniereModification = new Date().toISOString();

  // Tentative de synchronisation Baserow via l'API serveur (ou config locale)
  const config = getBaserowConfig();
  let syncResult: { success: boolean; error?: string } | undefined;

  if (config.autoSyncOnSave) {
    const res = await syncTicketWithBaserow(ticket, config);
    if (res.success && res.rowId) {
      ticket.baserowRowId = res.rowId;
      ticket.baserowSyncStatus = 'synced';
      ticket.baserowSyncDate = new Date().toISOString();
      delete ticket.baserowSyncError;
      syncResult = { success: true };
    } else {
      ticket.baserowSyncStatus = 'error';
      ticket.baserowSyncError = res.error;
      syncResult = { success: false, error: res.error };
    }
  } else {
    if (!ticket.baserowRowId) {
      ticket.baserowSyncStatus = 'pending';
    }
  }

  if (existingIdx >= 0) {
    tickets[existingIdx] = ticket;
  } else {
    tickets.unshift(ticket);
  }

  saveTickets(tickets);
  return { ticket, syncResult };
}

export function deleteTicket(id: string): void {
  const tickets = getTickets().filter(t => t.id !== id);
  saveTickets(tickets);
}

export async function syncAllPendingTickets(): Promise<{ syncedCount: number; errorCount: number; errors: string[] }> {
  const config = getBaserowConfig();

  const tickets = getTickets();
  let syncedCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < tickets.length; i++) {
    const t = tickets[i];
    // On synchronise les pending ou error
    if (t.baserowSyncStatus !== 'synced' || !t.baserowRowId) {
      const res = await syncTicketWithBaserow(t, config);
      if (res.success && res.rowId) {
        t.baserowRowId = res.rowId;
        t.baserowSyncStatus = 'synced';
        t.baserowSyncDate = new Date().toISOString();
        delete t.baserowSyncError;
        syncedCount++;
      } else {
        t.baserowSyncStatus = 'error';
        t.baserowSyncError = res.error;
        errorCount++;
        errors.push(`${t.id} : ${res.error || 'Erreur inconnue'}`);
      }
    }
  }

  saveTickets(tickets);
  return { syncedCount, errorCount, errors };
}

/**
 * Récupère les tickets depuis Baserow et les fusionne avec le cache local
 * pour permettre le partage multi-appareils (PC + smartphone).
 */
export async function pullAndMergeBaserowTickets(): Promise<{
  configured: boolean;
  tickets: SAVTicket[];
  error?: string;
}> {
  const localTickets = getTickets();
  const remoteRes = await fetchTicketsFromBaserow();

  if (!remoteRes.configured || remoteRes.error) {
    return {
      configured: remoteRes.configured,
      tickets: localTickets,
      error: remoteRes.error,
    };
  }

  const localByKey = new Map<string, SAVTicket>();
  for (const lt of localTickets) {
    localByKey.set(lt.id, lt);
  }

  const merged: SAVTicket[] = [];
  const seenIds = new Set<string>();

  for (const rt of remoteRes.tickets) {
    seenIds.add(rt.id);
    const localMatch =
      localByKey.get(rt.id) ||
      localTickets.find((lt) => lt.baserowRowId && lt.baserowRowId === rt.baserowRowId);

    if (localMatch) {
      // Conserver les champs riches locaux non stockés dans Baserow (signature, adresse, SIRET, etc.)
      merged.push({
        ...rt,
        client: {
          ...rt.client,
          adresse: localMatch.client.adresse || rt.client.adresse,
          codePostal: localMatch.client.codePostal || rt.client.codePostal,
          ville: localMatch.client.ville || rt.client.ville,
          siret: localMatch.client.siret || rt.client.siret,
        },
        materiel: {
          ...rt.materiel,
          systemeExploitation:
            localMatch.materiel.systemeExploitation || rt.materiel.systemeExploitation,
        },
        rapportTechnique: {
          ...localMatch.rapportTechnique,
          ...rt.rapportTechnique,
        },
        signatureClient: localMatch.signatureClient,
        signatureTechnicien: localMatch.signatureTechnicien,
        technicienResponsable: localMatch.technicienResponsable,
      });
    } else {
      merged.push(rt);
    }
  }

  // Conserver les tickets locaux pas encore synchronisés (file d'attente hors-ligne)
  for (const lt of localTickets) {
    if (!seenIds.has(lt.id) && (lt.baserowSyncStatus !== 'synced' || !lt.baserowRowId)) {
      merged.unshift(lt);
    }
  }

  // Mettre à jour le compteur local pour éviter les collisions d'ID entre PC et smartphone
  let maxNum = parseInt(localStorage.getItem(STORAGE_KEYS.COUNTER) || '3', 10);
  for (const t of merged) {
    const match = t.id.match(/DK-SAV-\d{4}-(\d+)/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (!Number.isNaN(n) && n > maxNum) {
        maxNum = n;
      }
    }
  }
  localStorage.setItem(STORAGE_KEYS.COUNTER, String(maxNum));

  saveTickets(merged);
  return { configured: true, tickets: merged };
}
