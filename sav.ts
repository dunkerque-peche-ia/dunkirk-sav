export type ClientType = 'particulier' | 'professionnel';

export type DeviceCategory = 
  | 'pc_portable'
  | 'pc_tour'
  | 'macbook'
  | 'imac'
  | 'serveur'
  | 'disque_dur'
  | 'smartphone_tablette'
  | 'autre';

export type SAVStatus = 
  | 'depose'
  | 'diagnostic'
  | 'devis_attente'
  | 'pieces_commandees'
  | 'reparation'
  | 'tests'
  | 'pret'
  | 'restitue';

export type UrgencyLevel = 'standard' | 'express' | 'devis_obligatoire';

export type DataPriority = 'indispensable' | 'souhaitable' | 'aucune_sans_importance';

export interface ClientInfo {
  type: ClientType;
  nom: string;
  prenom: string;
  societe?: string;
  siret?: string;
  telephone: string;
  email: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
}

export interface DeviceInfo {
  categorie: DeviceCategory;
  marque: string;
  modele: string;
  numeroSerie?: string;
  systemeExploitation?: string;
  motDePasseSession?: string;
  aMotDePasse: boolean;
}

export interface Accessories {
  chargeur: boolean;
  cableAlimentation: boolean;
  sacoche: boolean;
  souris: boolean;
  adaptateur: boolean;
  disqueExterne: boolean;
  cleUsb: boolean;
  boiteOrigine: boolean;
  autres?: string;
}

export interface VisualInspection {
  rayuresChassis: boolean;
  chocsFissures: boolean;
  ecranRayures: boolean;
  ecranCasse: boolean;
  charnieresAbimees: boolean;
  visManquantes: boolean;
  tracesLiquide: boolean;
  touchesClavierManquantes: boolean;
  commentairesEtat?: string;
}

export interface DiagnosticRequest {
  descriptionPanne: string;
  circonstancesPanne?: string;
  sauvegardeDonnees: DataPriority;
  dossiersCruciaux?: string;
  dejaRepareAilleurs: boolean;
  logicielsSpecifiques?: string;
}

export interface ConditionsSAV {
  urgence: UrgencyLevel;
  budgetMaxiSansDevis?: number;
  acompteVerse?: number;
  modePaiementAcompte?: string;
  delaiSouhaite?: string;
  accepteConditions: boolean;
}

export interface TechnicalReport {
  diagnosticTechnicien?: string;
  actionsEffectuees?: string;
  piecesRemplacees?: string;
  tempsPasseHeures?: number;
  montantTotalTTC?: number;
  garantieMois?: number;
  dateCloture?: string;
}

export interface SAVTicket {
  id: string; // Ex: DK-SAV-2026-0001
  dateDepot: string; // ISO String
  derniereModification: string; // ISO String
  statut: SAVStatus;
  
  client: ClientInfo;
  materiel: DeviceInfo;
  accessoires: Accessories;
  etatVisuel: VisualInspection;
  demandeClient: DiagnosticRequest;
  conditions: ConditionsSAV;
  rapportTechnique?: TechnicalReport;
  
  signatureClient?: string; // Data URL Base64
  signatureTechnicien?: string;
  technicienResponsable?: string;
  
  // Baserow Sync metadata
  baserowRowId?: number;
  baserowSyncStatus: 'synced' | 'pending' | 'error';
  baserowSyncDate?: string;
  baserowSyncError?: string;
}

export interface BaserowConfig {
  apiUrl: string; // default https://api.baserow.io
  databaseToken: string;
  tableId: string;
  autoSyncOnSave: boolean;
  userFieldNames: boolean;
}

export const STATUS_CONFIG: Record<SAVStatus, { label: string; color: string; bg: string; border: string }> = {
  depose: {
    label: 'Déposé / En attente',
    color: 'text-amber-300',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30'
  },
  diagnostic: {
    label: 'Diagnostic en cours',
    color: 'text-blue-300',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/30'
  },
  devis_attente: {
    label: 'Devis envoyé / En attente',
    color: 'text-orange-300',
    bg: 'bg-orange-500/15',
    border: 'border-orange-500/30'
  },
  pieces_commandees: {
    label: 'Pièces commandées',
    color: 'text-purple-300',
    bg: 'bg-purple-500/15',
    border: 'border-purple-500/30'
  },
  reparation: {
    label: 'Réparation en cours',
    color: 'text-cyan-300',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/30'
  },
  tests: {
    label: 'Tests & Contrôle qualité',
    color: 'text-indigo-300',
    bg: 'bg-indigo-500/15',
    border: 'border-indigo-500/30'
  },
  pret: {
    label: 'Prêt à être retiré',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30'
  },
  restitue: {
    label: 'Restitué / Clôturé',
    color: 'text-slate-400',
    bg: 'bg-slate-500/15',
    border: 'border-slate-500/30'
  }
};

export const DEVICE_CATEGORIES: Record<DeviceCategory, string> = {
  pc_portable: 'PC Portable',
  pc_tour: 'PC Tour / Fixe',
  macbook: 'Apple MacBook (Pro/Air)',
  imac: 'Apple iMac / Mac Mini',
  serveur: 'Serveur / NAS Réseau',
  disque_dur: 'Disque dur / SSD / Récupération',
  smartphone_tablette: 'Smartphone / Tablette',
  autre: 'Autre équipement informatique'
};
