import {
  SAVTicket,
  SAVStatus,
  DeviceCategory,
  STATUS_CONFIG,
  DEVICE_CATEGORIES,
} from '@/types/sav';
import { mapTicketToBaserowFields } from '@/services/baserow';

export interface ServerBaserowConfig {
  apiUrl: string;
  databaseToken: string;
  tableId: string;
}

export function getServerBaserowConfig(override?: Partial<ServerBaserowConfig>): ServerBaserowConfig {
  const apiUrl = (override?.apiUrl || process.env.BASEROW_API_URL || '').trim().replace(/\/+$/, '');
  const databaseToken = (override?.databaseToken || process.env.BASEROW_DATABASE_TOKEN || '').trim();
  const tableId = (override?.tableId || process.env.BASEROW_TABLE_ID || '').trim();
  return { apiUrl, databaseToken, tableId };
}

export function isServerBaserowConfigured(config?: ServerBaserowConfig): boolean {
  const cfg = config || getServerBaserowConfig();
  return Boolean(cfg.apiUrl && cfg.databaseToken && cfg.tableId);
}

function extractText(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object' && 'value' in (val as Record<string, unknown>)) {
    return String((val as Record<string, unknown>).value ?? '');
  }
  return '';
}

function parseStatus(raw: unknown): SAVStatus {
  const label = extractText(raw).trim().toLowerCase();
  if (!label) return 'depose';

  for (const [key, cfg] of Object.entries(STATUS_CONFIG)) {
    if (key === label || cfg.label.toLowerCase() === label) {
      return key as SAVStatus;
    }
  }

  if (label.includes('diagnostic')) return 'diagnostic';
  if (label.includes('devis')) return 'devis_attente';
  if (label.includes('pièce') || label.includes('piece')) return 'pieces_commandees';
  if (label.includes('réparation') || label.includes('reparation')) return 'reparation';
  if (label.includes('test')) return 'tests';
  if (label.includes('prêt') || label.includes('pret')) return 'pret';
  if (label.includes('restitu')) return 'restitue';
  return 'depose';
}

function parseCategory(raw: unknown): DeviceCategory {
  const label = extractText(raw).trim().toLowerCase();
  if (!label) return 'autre';

  for (const [key, catLabel] of Object.entries(DEVICE_CATEGORIES)) {
    if (key === label || catLabel.toLowerCase() === label) {
      return key as DeviceCategory;
    }
  }

  if (label.includes('portable')) return 'pc_portable';
  if (label.includes('tour') || label.includes('fixe')) return 'pc_tour';
  if (label.includes('macbook')) return 'macbook';
  if (label.includes('imac')) return 'imac';
  if (label.includes('serveur') || label.includes('nas')) return 'serveur';
  if (label.includes('disque') || label.includes('ssd')) return 'disque_dur';
  if (label.includes('smartphone') || label.includes('tablette')) return 'smartphone_tablette';
  return 'autre';
}

export function mapBaserowRowToTicket(row: Record<string, any>): SAVTicket {
  const ticketId = extractText(row['Numéro Ticket']) || `DK-SAV-ROW-${row.id}`;
  const dateDepotRaw = extractText(row['Date Dépôt']);
  const dateDepot = dateDepotRaw ? new Date(dateDepotRaw).toISOString() : new Date().toISOString();

  const lastUpdateRaw = extractText(row['Dernière Mise à Jour']);
  const derniereModification = lastUpdateRaw
    ? new Date(lastUpdateRaw.replace(' ', 'T')).toISOString()
    : dateDepot;

  const clientTypeText = extractText(row['Type Client']).toLowerCase();
  const isPro = clientTypeText.includes('pro');

  const passwordRaw = extractText(row['Mot de Passe']);
  const hasPassword = Boolean(passwordRaw && passwordRaw.toLowerCase() !== 'aucun');

  const sauvegardeText = extractText(row['Sauvegarde Données']).toLowerCase();
  const sauvegardeDonnees = sauvegardeText.includes('indispensable')
    ? 'indispensable'
    : sauvegardeText.includes('souhaitable')
      ? 'souhaitable'
      : 'aucune_sans_importance';

  const urgenceText = extractText(row['Urgence']).toLowerCase();
  const urgence = urgenceText.includes('express')
    ? 'express'
    : urgenceText.includes('devis')
      ? 'devis_obligatoire'
      : 'standard';

  const accText = extractText(row['Accessoires']);
  const accLower = accText.toLowerCase();

  const inspText = extractText(row['État Visuel Initial']);
  const inspLower = inspText.toLowerCase();

  const diagnosticText = extractText(row['Diagnostic Technicien']);
  const montantRaw = row['Montant Total TTC'];
  const montantTotalTTC =
    montantRaw !== null && montantRaw !== undefined && montantRaw !== ''
      ? Number(montantRaw)
      : undefined;

  return {
    id: ticketId,
    dateDepot,
    derniereModification: Number.isNaN(Date.parse(derniereModification))
      ? dateDepot
      : derniereModification,
    statut: parseStatus(row['Statut']),
    client: {
      type: isPro ? 'professionnel' : 'particulier',
      nom: extractText(row['Client Nom']) || 'Client',
      prenom: extractText(row['Client Prénom']),
      societe: extractText(row['Société']) || undefined,
      telephone: extractText(row['Téléphone']),
      email: extractText(row['Email']),
    },
    materiel: {
      categorie: parseCategory(row['Catégorie Matériel']),
      marque: extractText(row['Marque']),
      modele: extractText(row['Modèle']),
      numeroSerie: extractText(row['Numéro de Série']) || undefined,
      motDePasseSession:
        hasPassword && passwordRaw !== 'Oui (non renseigné)' ? passwordRaw : undefined,
      aMotDePasse: hasPassword,
    },
    accessoires: {
      chargeur: accLower.includes('chargeur'),
      cableAlimentation: accLower.includes('câble alim') || accLower.includes('cable alim'),
      sacoche: accLower.includes('sacoche'),
      souris: accLower.includes('souris'),
      adaptateur: accLower.includes('adaptateur'),
      disqueExterne: accLower.includes('disque externe'),
      cleUsb: accLower.includes('clé usb') || accLower.includes('cle usb'),
      boiteOrigine: accLower.includes('boîte origine') || accLower.includes('boite origine'),
    },
    etatVisuel: {
      rayuresChassis: inspLower.includes('rayures châssis'),
      chocsFissures: inspLower.includes('chocs/fissures'),
      ecranRayures: inspLower.includes('écran rayé'),
      ecranCasse: inspLower.includes('écran cassé'),
      charnieresAbimees: inspLower.includes('charnières abîmées'),
      visManquantes: inspLower.includes('vis manquantes'),
      tracesLiquide: inspLower.includes('traces liquide'),
      touchesClavierManquantes: inspLower.includes('touches manquantes'),
      commentairesEtat:
        inspText && !inspLower.startsWith('bon état esthétique général')
          ? inspText
          : undefined,
    },
    demandeClient: {
      descriptionPanne: extractText(row['Description Panne']),
      sauvegardeDonnees,
      dossiersCruciaux: extractText(row['Dossiers à Sauvegarder']) || undefined,
      dejaRepareAilleurs: false,
    },
    conditions: {
      urgence,
      budgetMaxiSansDevis:
        row['Budget Max Sans Devis'] !== null && row['Budget Max Sans Devis'] !== undefined
          ? Number(row['Budget Max Sans Devis'])
          : undefined,
      acompteVerse:
        row['Acompte Versé'] !== null && row['Acompte Versé'] !== undefined
          ? Number(row['Acompte Versé'])
          : undefined,
      accepteConditions: true,
    },
    rapportTechnique:
      diagnosticText || montantTotalTTC !== undefined
        ? {
            diagnosticTechnicien: diagnosticText || undefined,
            montantTotalTTC: Number.isNaN(montantTotalTTC) ? undefined : montantTotalTTC,
          }
        : undefined,
    baserowRowId: Number(row.id),
    baserowSyncStatus: 'synced',
    baserowSyncDate: new Date().toISOString(),
  };
}

export async function fetchAllBaserowTickets(
  config: ServerBaserowConfig
): Promise<SAVTicket[]> {
  const rows: Record<string, any>[] = [];
  let nextUrl: string | null = `${config.apiUrl}/api/database/rows/table/${config.tableId}/?user_field_names=true&size=200`;

  while (nextUrl) {
    const res: Response = await fetch(nextUrl, {
      method: 'GET',
      headers: {
        Authorization: `Token ${config.databaseToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Erreur lecture Baserow (${res.status}) : ${errText.slice(0, 150)}`);
    }

    const data = await res.json();
    if (Array.isArray(data.results)) {
      rows.push(...data.results);
    }
    nextUrl = data.next || null;
  }

  return rows.map(mapBaserowRowToTicket).reverse();
}

export async function pushTicketToBaserow(
  ticket: SAVTicket,
  config: ServerBaserowConfig
): Promise<{ success: boolean; rowId?: number; error?: string }> {
  const fields = mapTicketToBaserowFields(ticket);

  try {
    if (ticket.baserowRowId) {
      const patchUrl = `${config.apiUrl}/api/database/rows/table/${config.tableId}/${ticket.baserowRowId}/?user_field_names=true`;
      const res = await fetch(patchUrl, {
        method: 'PATCH',
        headers: {
          Authorization: `Token ${config.databaseToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fields),
      });

      if (res.ok) {
        return { success: true, rowId: ticket.baserowRowId };
      }

      if (res.status !== 404) {
        const err = await res.text();
        return { success: false, error: `Erreur MAJ Baserow (${res.status}): ${err.slice(0, 120)}` };
      }
    }

    const postUrl = `${config.apiUrl}/api/database/rows/table/${config.tableId}/?user_field_names=true`;
    const res = await fetch(postUrl, {
      method: 'POST',
      headers: {
        Authorization: `Token ${config.databaseToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fields),
    });

    if (res.ok) {
      const createdRow = await res.json();
      return { success: true, rowId: createdRow.id };
    }

    const errText = await res.text();
    return {
      success: false,
      error: `Erreur Création Baserow (${res.status}) : ${errText.slice(0, 150)}`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Échec de connexion avec Baserow',
    };
  }
}
