import { SAVTicket, BaserowConfig, STATUS_CONFIG, DEVICE_CATEGORIES } from '@/types/sav';

export interface BaserowTestResult {
  success: boolean;
  message: string;
  statusCode?: number;
  tableDetails?: any;
}

export function formatAccessoriesSummary(acc: SAVTicket['accessoires']): string {
  const items: string[] = [];
  if (acc.chargeur) items.push('Chargeur');
  if (acc.cableAlimentation) items.push('Câble Alim');
  if (acc.sacoche) items.push('Sacoche');
  if (acc.souris) items.push('Souris');
  if (acc.adaptateur) items.push('Adaptateur');
  if (acc.disqueExterne) items.push('Disque Externe');
  if (acc.cleUsb) items.push('Clé USB');
  if (acc.boiteOrigine) items.push('Boîte Origine');
  if (acc.autres) items.push(acc.autres);
  return items.length > 0 ? items.join(', ') : 'Aucun accessoire déposé';
}

export function formatInspectionSummary(insp: SAVTicket['etatVisuel']): string {
  const flaws: string[] = [];
  if (insp.rayuresChassis) flaws.push('Rayures châssis');
  if (insp.chocsFissures) flaws.push('Chocs/fissures');
  if (insp.ecranRayures) flaws.push('Écran rayé');
  if (insp.ecranCasse) flaws.push('Écran cassé');
  if (insp.charnieresAbimees) flaws.push('Charnières abîmées');
  if (insp.visManquantes) flaws.push('Vis manquantes');
  if (insp.tracesLiquide) flaws.push('Traces liquide');
  if (insp.touchesClavierManquantes) flaws.push('Touches manquantes');
  if (insp.commentairesEtat) flaws.push(insp.commentairesEtat);
  return flaws.length > 0 ? flaws.join(' | ') : 'Bon état esthétique général (sans anomalie majeure)';
}

/**
 * Prépare le dictionnaire de données pour l'enregistrement dans Baserow
 * Compatible avec l'option user_field_names=true
 */
export function mapTicketToBaserowFields(ticket: SAVTicket): Record<string, any> {
  return {
    'Numéro Ticket': ticket.id,
    'Date Dépôt': ticket.dateDepot.slice(0, 10),
    'Statut': STATUS_CONFIG[ticket.statut]?.label || ticket.statut,
    'Client Nom': ticket.client.nom,
    'Client Prénom': ticket.client.prenom,
    'Téléphone': ticket.client.telephone,
    'Email': ticket.client.email,
    'Type Client': ticket.client.type === 'professionnel' ? 'Professionnel' : 'Particulier',
    'Société': ticket.client.societe || '',
    'Catégorie Matériel': DEVICE_CATEGORIES[ticket.materiel.categorie] || ticket.materiel.categorie,
    'Marque': ticket.materiel.marque,
    'Modèle': ticket.materiel.modele,
    'Numéro de Série': ticket.materiel.numeroSerie || '',
    'Mot de Passe': ticket.materiel.motDePasseSession || (ticket.materiel.aMotDePasse ? 'Oui (non renseigné)' : 'Aucun'),
    'Description Panne': ticket.demandeClient.descriptionPanne,
    'Sauvegarde Données': ticket.demandeClient.sauvegardeDonnees === 'indispensable' 
      ? 'Indispensable' 
      : ticket.demandeClient.sauvegardeDonnees === 'souhaitable' 
        ? 'Souhaitable' 
        : 'Sans importance',
    'Dossiers à Sauvegarder': ticket.demandeClient.dossiersCruciaux || '',
    'Accessoires': formatAccessoriesSummary(ticket.accessoires),
    'État Visuel Initial': formatInspectionSummary(ticket.etatVisuel),
    'Urgence': ticket.conditions.urgence === 'express' 
      ? 'Express 24h' 
      : ticket.conditions.urgence === 'devis_obligatoire' 
        ? 'Devis obligatoire' 
        : 'Standard',
    'Budget Max Sans Devis': ticket.conditions.budgetMaxiSansDevis || 0,
    'Acompte Versé': ticket.conditions.acompteVerse || 0,
    'Diagnostic Technicien': ticket.rapportTechnique?.diagnosticTechnicien || '',
    'Montant Total TTC': ticket.rapportTechnique?.montantTotalTTC || 0,
    'Dernière Mise à Jour': new Date().toISOString().replace('T', ' ').slice(0, 19)
  };
}

/**
/**
 * Teste la connexion à l'instance Baserow via le proxy serveur sécurisé
 */
export async function testBaserowConnection(config?: Partial<BaserowConfig>): Promise<BaserowTestResult> {
  try {
    const res = await fetch('/api/baserow/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiUrl: config?.apiUrl || undefined,
        databaseToken: config?.databaseToken || undefined,
        tableId: config?.tableId || undefined,
      }),
    });
    const data = await res.json();
    return {
      success: Boolean(data.success),
      message: data.message || 'Réponse inattendue du serveur.',
      statusCode: data.statusCode ?? res.status,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Impossible de contacter le serveur : ${err.message || 'Erreur réseau'}.`,
    };
  }
}

/**
 * Récupère l'état de la configuration Baserow côté serveur (sans exposer le token)
 */
export async function fetchServerBaserowStatus(): Promise<{
  configured: boolean;
  apiUrl: string;
  tableId: string;
  hasServerToken: boolean;
}> {
  try {
    const res = await fetch('/api/baserow/config', { cache: 'no-store' });
    if (!res.ok) {
      return { configured: false, apiUrl: '', tableId: '', hasServerToken: false };
    }
    return await res.json();
  } catch {
    return { configured: false, apiUrl: '', tableId: '', hasServerToken: false };
  }
}

/**
 * Récupère tous les tickets depuis Baserow via l'API serveur
 */
export async function fetchTicketsFromBaserow(): Promise<{
  configured: boolean;
  tickets: SAVTicket[];
  error?: string;
}> {
  try {
    const res = await fetch('/api/baserow/tickets', { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) {
      return {
        configured: Boolean(data.configured),
        tickets: [],
        error: data.error || `Erreur serveur (${res.status})`,
      };
    }
    return {
      configured: Boolean(data.configured),
      tickets: Array.isArray(data.tickets) ? data.tickets : [],
    };
  } catch (err: any) {
    return {
      configured: false,
      tickets: [],
      error: err.message || 'Erreur réseau lors de la lecture Baserow',
    };
  }
}

/**
 * Enregistre ou met à jour un ticket SAV dans Baserow via l'API serveur
 */
export async function syncTicketWithBaserow(
  ticket: SAVTicket,
  config?: Partial<BaserowConfig>
): Promise<{ success: boolean; rowId?: number; error?: string }> {
  try {
    const res = await fetch('/api/baserow/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticket,
        config:
          config?.apiUrl && config?.databaseToken && config?.tableId
            ? {
                apiUrl: config.apiUrl,
                databaseToken: config.databaseToken,
                tableId: config.tableId,
              }
            : undefined,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, rowId: data.rowId };
    }

    return {
      success: false,
      error: data.error || `Erreur serveur (${res.status})`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Échec de connexion avec le serveur',
    };
  }
}

/**
 * Schéma recommandé des colonnes à créer dans Baserow
 */
export const RECOMMENDED_BASEROW_SCHEMA = [
  { name: 'Numéro Ticket', type: 'Single line text', required: true, desc: 'Identifiant unique (ex: DK-SAV-2026-0001)' },
  { name: 'Date Dépôt', type: 'Date', required: true, desc: 'Date de prise en charge à l’atelier' },
  { name: 'Statut', type: 'Single select / Text', required: true, desc: 'Déposé, Diagnostic, Réparation, Prêt, Restitué...' },
  { name: 'Client Nom', type: 'Single line text', required: true, desc: 'Nom de famille du client' },
  { name: 'Client Prénom', type: 'Single line text', required: true, desc: 'Prénom du client' },
  { name: 'Téléphone', type: 'Phone number / Text', required: true, desc: 'Numéro de mobile/fixe pour joindre le client' },
  { name: 'Email', type: 'Email', required: false, desc: 'Email pour envoi de devis et notifications' },
  { name: 'Type Client', type: 'Single select', required: false, desc: 'Particulier ou Professionnel' },
  { name: 'Société', type: 'Single line text', required: false, desc: 'Raison sociale si professionnel' },
  { name: 'Catégorie Matériel', type: 'Single select', required: true, desc: 'PC Portable, PC Tour, Mac, Serveur...' },
  { name: 'Marque', type: 'Single line text', required: true, desc: 'Dell, Asus, HP, Apple, Lenovo...' },
  { name: 'Modèle', type: 'Single line text', required: true, desc: 'Modèle exact de l’ordinateur' },
  { name: 'Numéro de Série', type: 'Single line text', required: false, desc: 'S/N ou Service Tag matériel' },
  { name: 'Mot de Passe', type: 'Single line text', required: false, desc: 'Session Windows / macOS pour tests' },
  { name: 'Description Panne', type: 'Long text', required: true, desc: 'Symptômes détaillés décrits par le client' },
  { name: 'Sauvegarde Données', type: 'Single select', required: false, desc: 'Indispensable, Souhaitable, Sans importance' },
  { name: 'Dossiers à Sauvegarder', type: 'Single line text', required: false, desc: 'Bureau, Documents, Photos, Logiciel compta...' },
  { name: 'Accessoires', type: 'Long text', required: false, desc: 'Chargeur, sacoche, câbles déposés' },
  { name: 'État Visuel Initial', type: 'Long text', required: false, desc: 'Rayures, chocs préexistants pour traçabilité' },
  { name: 'Urgence', type: 'Single select', required: false, desc: 'Standard, Express 24h, Devis obligatoire' },
  { name: 'Budget Max Sans Devis', type: 'Number (€)', required: false, desc: 'Seuil budgétaire accordé sans devis' },
  { name: 'Acompte Versé', type: 'Number (€)', required: false, desc: 'Montant encaissé à la dépose' },
  { name: 'Diagnostic Technicien', type: 'Long text', required: false, desc: 'Conclusions du test atelier' },
  { name: 'Montant Total TTC', type: 'Number (€)', required: false, desc: 'Total facturé final' },
  { name: 'Dernière Mise à Jour', type: 'Single line text / Date', required: false, desc: 'Horodatage dernière action' }
];
