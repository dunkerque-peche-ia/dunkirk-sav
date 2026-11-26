'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Laptop, 
  Monitor, 
  HardDrive, 
  Smartphone, 
  Server, 
  KeyRound, 
  Package, 
  CheckSquare, 
  AlertTriangle, 
  ShieldAlert, 
  FileText, 
  Zap, 
  Clock, 
  CreditCard, 
  PenTool, 
  Save, 
  Printer, 
  Eraser,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { 
  SAVTicket, 
  ClientType, 
  DeviceCategory, 
  DataPriority, 
  UrgencyLevel,
  DEVICE_CATEGORIES 
} from '@/types/sav';
import { generateNextTicketId, saveOrUpdateTicket } from '@/services/storage';

interface IntakeFormProps {
  onTicketCreated: (ticket: SAVTicket, autoPrint?: boolean) => void;
}

export default function IntakeForm({ onTicketCreated }: IntakeFormProps) {
  // 1. Client Info State
  const [clientType, setClientType] = useState<ClientType>('particulier');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [societe, setSociete] = useState('');
  const [siret, setSiret] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [adresse, setAdresse] = useState('');
  const [codePostal, setCodePostal] = useState('59140');
  const [ville, setVille] = useState('Dunkerque');

  // 2. Device Info State
  const [categorie, setCategorie] = useState<DeviceCategory>('pc_portable');
  const [marque, setMarque] = useState('');
  const [modele, setModele] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [systemeExploitation, setSystemeExploitation] = useState('Windows 11');
  const [aMotDePasse, setAMotDePasse] = useState(true);
  const [motDePasseSession, setMotDePasseSession] = useState('');

  // 3. Accessories State
  const [accessories, setAccessories] = useState({
    chargeur: true,
    cableAlimentation: false,
    sacoche: false,
    souris: false,
    adaptateur: false,
    disqueExterne: false,
    cleUsb: false,
    boiteOrigine: false,
    autres: ''
  });

  // 4. Visual Inspection State
  const [inspection, setInspection] = useState({
    rayuresChassis: false,
    chocsFissures: false,
    ecranRayures: false,
    ecranCasse: false,
    charnieresAbimees: false,
    visManquantes: false,
    tracesLiquide: false,
    touchesClavierManquantes: false,
    commentairesEtat: ''
  });

  // 5. Diagnostic Request State
  const [descriptionPanne, setDescriptionPanne] = useState('');
  const [circonstancesPanne, setCirconstancesPanne] = useState('');
  const [sauvegardeDonnees, setSauvegardeDonnees] = useState<DataPriority>('souhaitable');
  const [dossiersCruciaux, setDossiersCruciaux] = useState('');
  const [dejaRepareAilleurs, setDejaRepareAilleurs] = useState(false);

  // 6. Conditions & Urgency State
  const [urgence, setUrgence] = useState<UrgencyLevel>('standard');
  const [budgetMaxiSansDevis, setBudgetMaxiSansDevis] = useState<number | undefined>(150);
  const [acompteVerse, setAcompteVerse] = useState<number | undefined>(0);
  const [modePaiementAcompte, setModePaiementAcompte] = useState('Carte Bancaire');
  const [delaiSouhaite, setDelaiSouhaite] = useState('');
  const [accepteConditions, setAccepteConditions] = useState(true);

  // 7. Electronic Signature State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  // Status & Notification
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Setup canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#DDA727';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSigned(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const getSignatureDataUrl = (): string | undefined => {
    if (!hasSigned) return undefined;
    return canvasRef.current?.toDataURL('image/png');
  };

  const handleSubmit = async (e: React.FormEvent, autoPrint: boolean = false) => {
    e.preventDefault();
    setSubmitError(null);

    // Basic validation
    if (!nom.trim() || !telephone.trim()) {
      setSubmitError('Veuillez renseigner au minimum le Nom et le Téléphone du client.');
      return;
    }
    if (!marque.trim() || !modele.trim()) {
      setSubmitError('Veuillez renseigner la Marque et le Modèle de l’équipement.');
      return;
    }
    if (!descriptionPanne.trim()) {
      setSubmitError('Veuillez décrire le problème ou la panne signalée par le client.');
      return;
    }
    if (!accepteConditions) {
      setSubmitError('Le client doit accepter les conditions de prise en charge et de sauvegarde.');
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketId = generateNextTicketId();
      const now = new Date().toISOString();

      const newTicket: SAVTicket = {
        id: ticketId,
        dateDepot: now,
        derniereModification: now,
        statut: 'depose',
        client: {
          type: clientType,
          nom: nom.trim(),
          prenom: prenom.trim(),
          societe: societe.trim() || undefined,
          siret: siret.trim() || undefined,
          telephone: telephone.trim(),
          email: email.trim(),
          adresse: adresse.trim() || undefined,
          codePostal: codePostal.trim() || undefined,
          ville: ville.trim() || undefined
        },
        materiel: {
          categorie,
          marque: marque.trim(),
          modele: modele.trim(),
          numeroSerie: numeroSerie.trim() || undefined,
          systemeExploitation: systemeExploitation.trim() || undefined,
          aMotDePasse,
          motDePasseSession: aMotDePasse ? motDePasseSession.trim() || undefined : undefined
        },
        accessoires: { ...accessories },
        etatVisuel: { ...inspection },
        demandeClient: {
          descriptionPanne: descriptionPanne.trim(),
          circonstancesPanne: circonstancesPanne.trim() || undefined,
          sauvegardeDonnees,
          dossiersCruciaux: dossiersCruciaux.trim() || undefined,
          dejaRepareAilleurs
        },
        conditions: {
          urgence,
          budgetMaxiSansDevis: Number(budgetMaxiSansDevis) || 0,
          acompteVerse: Number(acompteVerse) || 0,
          modePaiementAcompte: Number(acompteVerse) > 0 ? modePaiementAcompte : undefined,
          delaiSouhaite: delaiSouhaite.trim() || undefined,
          accepteConditions
        },
        signatureClient: getSignatureDataUrl(),
        technicienResponsable: 'Atelier Dunkirk Informatique',
        baserowSyncStatus: 'pending'
      };

      const { ticket: savedTicket, syncResult } = await saveOrUpdateTicket(newTicket);
      setIsSubmitting(false);
      onTicketCreated(savedTicket, autoPrint);
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err.message || 'Une erreur est survenue lors de l’enregistrement du ticket.');
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8 pb-16">
      
      {/* En-tête formulaire avec badge */}
      <div className="bg-gradient-to-r from-dunkirk-navy via-dunkirk-card to-dunkirk-navy p-6 rounded-2xl border border-dunkirk-border shadow-navy-glow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-dunkirk-gold text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Fiche d&apos;Admission Atelier</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Prise en Charge SAV Matériel
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            Enregistrement du matériel déposé au comptoir de Dunkirk Informatique.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-dunkirk-dark/70 border border-dunkirk-gold/30 px-4 py-2.5 rounded-xl text-right">
            <span className="block text-[11px] text-slate-400 font-medium uppercase">Prochain N° Dossier</span>
            <span className="text-base font-extrabold text-dunkirk-gold">DK-SAV-2026-AUTO</span>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-sm flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Informations manquantes</h4>
            <p className="mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      {/* SECTION 1 : COORDONNÉES CLIENT */}
      <div className="bg-dunkirk-card p-6 sm:p-8 rounded-2xl border border-dunkirk-border shadow-lg">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-dunkirk-gold/15 text-dunkirk-gold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">1. Coordonnées du Client</h3>
              <p className="text-xs text-slate-400">Particulier ou Professionnel dépositaire</p>
            </div>
          </div>

          {/* Toggle Type Client */}
          <div className="flex bg-dunkirk-dark p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setClientType('particulier')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                clientType === 'particulier'
                  ? 'bg-dunkirk-gold text-dunkirk-dark shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Particulier
            </button>
            <button
              type="button"
              onClick={() => setClientType('professionnel')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                clientType === 'professionnel'
                  ? 'bg-dunkirk-gold text-dunkirk-dark shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Professionnel / PME
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clientType === 'professionnel' && (
            <>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Raison Sociale / Société <span className="text-dunkirk-gold">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={societe}
                    onChange={(e) => setSociete(e.target.value)}
                    placeholder="Ex: Flandres Logistique SARL, Cabinet Martin..."
                    className="w-full bg-dunkirk-dark border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-dunkirk-gold transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">N° SIRET (optionnel)</label>
                <input
                  type="text"
                  value={siret}
                  onChange={(e) => setSiret(e.target.value)}
                  placeholder="14 chiffres"
                  className="w-full bg-dunkirk-dark border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-dunkirk-gold transition"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nom de famille <span className="text-dunkirk-gold">*</span>
            </label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Dupont, Vansteenkiste..."
              className="w-full bg-dunkirk-dark border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-dunkirk-gold transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Prénom</label>
            <input
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Ex: Marc, Céline..."
              className="w-full bg-dunkirk-dark border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-dunkirk-gold transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Téléphone mobile/fixe <span className="text-dunkirk-gold">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                required
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="06 12 34 56 78"
                className="w-full bg-dunkirk-dark border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-dunkirk-gold transition font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Adresse Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@domaine.fr"
                className="w-full bg-dunkirk-dark border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-dunkirk-gold transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ville & CP</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={codePostal}
                onChange={(e) => setCodePostal(e.target.value)}
                placeholder="59140"
                className="col-span-1 bg-dunkirk-dark border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-dunkirk-gold transition text-center font-mono"
              />
              <input
                type="text"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                placeholder="Dunkerque"
                className="col-span-2 bg-dunkirk-dark border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-dunkirk-gold transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Adresse (optionnelle)</label>
            <input
              type="text"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Numéro et rue..."
              className="w-full bg-dunkirk-dark border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-dunkirk-gold transition"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2 : MATÉRIEL & ACCÈS SESSION */}
      <div className="bg-dunkirk-card p-6 sm:p-8 rounded-2xl border border-dunkirk-border shadow-lg">
        <div className="flex items-center space-x-3 pb-4 mb-6 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-dunkirk-gold/15 text-dunkirk-gold">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">2. Identification du Matériel</h3>
            <p className="text-xs text-slate-400">Appareil, marque, modèle et accès pour le diagnostic</p>
          </div>
        </div>

        {/* Sélecteur de catégorie d'équipement */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 mb-2.5">Catégorie de matériel</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'pc_portable', label: 'PC Portable', icon: Laptop },
              { id: 'pc_tour', label: 'PC Fixe / Tour', icon: Monitor },
              { id: 'macbook', label: 'MacBook', icon: Laptop },
              { id: 'imac', label: 'iMac / Mac Mini', icon: Monitor },
              { id: 'serveur', label: 'Serveur / NAS', icon: Server },
              { id: 'disque_dur', label: 'Disque / SSD', icon: HardDrive },
              { id: 'smartphone_tablette', label: 'Smartphone / Tablette', icon: Smartphone },
              { id: 'autre', label: 'Autre équipement', icon: Package },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setCategorie(id as DeviceCategory)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition ${
                  categorie === id
                    ? 'bg-dunkirk-navy border-dunkirk-gold text-dunkirk-gold shadow-md scale-[1.02]'
                    : 'bg-dunkirk-dark/60 border-slate-800 text-slate-400 hover:text-white hover:bg-dunkirk-dark'
                }`}
              >
                <Icon className="w-5 h-5 mb-1.5" />
                <span className="text-xs font-bold leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Marque <span className="text-dunkirk-gold">*</span>
            </label>
            <input
              type="text"
              required
              value={marque}
              onChange={(e) => setMarque(e.target.value)}
              placeholder="Ex: Asus, HP, Dell, Apple, Lenovo..."
              className="w-full bg-dunkirk-dark border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-dunkirk-gold transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Modèle exact <span className="text-dunkirk-gold">*</span>
            </label>
            <input
              type="text"
              required
              value={modele}
              onChange={(e) => setModele(e.target.value)}
              placeholder="Ex: Vivobook S15, Pavilion 17, A2337..."
              className="w-full bg-dunkirk-dark border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-dunkirk-gold transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">N° de Série (S/N / Service Tag)</label>
            <input
              type="text"
              value={numeroSerie}
              onChange={(e) => setNumeroSerie(e.target.value)}
              placeholder="Ex: CNU91204X9, F6TYK8..."
              className="w-full bg-dunkirk-dark border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-dunkirk-gold transition font-mono"
            />
          </div>
        </div>

        {/* Mot de passe de session Windows / Mac */}
        <div className="mt-5 p-4 rounded-xl bg-dunkirk-dark/70 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-dunkirk-gold" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Accès Session pour Tests Atelier</span>
            </div>
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={!aMotDePasse}
                onChange={(e) => setAMotDePasse(!e.target.checked)}
                className="rounded border-slate-700 bg-dunkirk-dark text-dunkirk-gold focus:ring-0"
              />
              <span>Aucun mot de passe (session ouverte)</span>
            </label>
          </div>

          {aMotDePasse && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Mot de passe ou Code PIN</label>
                <input
                  type="text"
                  value={motDePasseSession}
                  onChange={(e) => setMotDePasseSession(e.target.value)}
                  placeholder="Ex: 1234, Azerty2026, session..."
                  className="w-full bg-dunkirk-card border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-dunkirk-gold font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Système d&apos;Exploitation</label>
                <select
                  value={systemeExploitation}
                  onChange={(e) => setSystemeExploitation(e.target.value)}
                  className="w-full bg-dunkirk-card border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-dunkirk-gold"
                >
                  <option value="Windows 11">Windows 11</option>
                  <option value="Windows 10">Windows 10</option>
                  <option value="macOS Sonoma / Sequoia">macOS (Apple)</option>
                  <option value="Linux Ubuntu / Debian">Linux (Ubuntu, Debian...)</option>
                  <option value="Windows Server">Windows Server</option>
                  <option value="Autre">Autre / Non spécifié</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3 : ACCESSOIRES & INSPECTION ÉTAT INITIAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Accessoires Déposés */}
        <div className="bg-dunkirk-card p-6 sm:p-7 rounded-2xl border border-dunkirk-border shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 pb-3 mb-5 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-dunkirk-gold/15 text-dunkirk-gold">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">3. Accessoires Déposés</h3>
                <p className="text-xs text-slate-400">Éléments laissés au comptoir avec l’appareil</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { key: 'chargeur', label: 'Chargeur secteur' },
                { key: 'cableAlimentation', label: 'Câble alimentation' },
                { key: 'sacoche', label: 'Sacoche / Housse' },
                { key: 'souris', label: 'Souris' },
                { key: 'adaptateur', label: 'Adaptateur / Câble vidéo' },
                { key: 'cleUsb', label: 'Clé USB / Dongle' },
                { key: 'disqueExterne', label: 'Disque dur externe' },
                { key: 'boiteOrigine', label: 'Boîte d’origine' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className={`flex items-center space-x-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                    (accessories as any)[key]
                      ? 'bg-dunkirk-navy/80 border-dunkirk-gold text-white'
                      : 'bg-dunkirk-dark/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={(accessories as any)[key]}
                    onChange={(e) => setAccessories({ ...accessories, [key]: e.target.checked })}
                    className="rounded border-slate-700 bg-dunkirk-dark text-dunkirk-gold focus:ring-0"
                  />
                  <span className="text-xs font-medium">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Autres accessoires spécifiques</label>
            <input
              type="text"
              value={accessories.autres}
              onChange={(e) => setAccessories({ ...accessories, autres: e.target.value })}
              placeholder="Ex: Carte SD 64Go, Stylet tactile..."
              className="w-full bg-dunkirk-dark border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-dunkirk-gold"
            />
          </div>
        </div>

        {/* État Visuel Initial (Traçabilité anti-litige) */}
        <div className="bg-dunkirk-card p-6 sm:p-7 rounded-2xl border border-dunkirk-border shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 pb-3 mb-5 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-dunkirk-gold/15 text-dunkirk-gold">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">4. État Esthétique Initial</h3>
                <p className="text-xs text-slate-400">Constat contradictoire à l&apos;arrivée</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { key: 'rayuresChassis', label: 'Rayures sur châssis' },
                { key: 'chocsFissures', label: 'Chocs / Fissures' },
                { key: 'ecranRayures', label: 'Micro-rayures écran' },
                { key: 'ecranCasse', label: 'Dalle écran cassée' },
                { key: 'charnieresAbimees', label: 'Charnières lâches' },
                { key: 'visManquantes', label: 'Vis manquantes' },
                { key: 'tracesLiquide', label: 'Traces d’oxydation / liquide' },
                { key: 'touchesClavierManquantes', label: 'Touches manquantes' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className={`flex items-center space-x-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                    (inspection as any)[key]
                      ? 'bg-rose-500/15 border-rose-500/50 text-rose-200'
                      : 'bg-dunkirk-dark/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={(inspection as any)[key]}
                    onChange={(e) => setInspection({ ...inspection, [key]: e.target.checked })}
                    className="rounded border-slate-700 bg-dunkirk-dark text-rose-500 focus:ring-0"
                  />
                  <span className="text-xs font-medium">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Commentaires cosmétiques</label>
            <input
              type="text"
              value={inspection.commentairesEtat}
              onChange={(e) => setInspection({ ...inspection, commentairesEtat: e.target.value })}
              placeholder="Ex: Trace d’impact sur le coin supérieur gauche..."
              className="w-full bg-dunkirk-dark border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-dunkirk-gold"
            />
          </div>
        </div>

      </div>

      {/* SECTION 4 : SYMPTÔMES & SAUVEGARDE DES DONNÉES */}
      <div className="bg-dunkirk-card p-6 sm:p-8 rounded-2xl border border-dunkirk-border shadow-lg">
        <div className="flex items-center space-x-3 pb-4 mb-6 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-dunkirk-gold/15 text-dunkirk-gold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">5. Problème Signalé & Sauvegarde</h3>
            <p className="text-xs text-slate-400">Panne constatée par le client et sensibilité des données</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description de la panne constatée <span className="text-dunkirk-gold">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={descriptionPanne}
              onChange={(e) => setDescriptionPanne(e.target.value)}
              placeholder="Ex: L'ordinateur démarre mais l'écran reste noir. Bip sonore continu. Le ventilateur tourne à fond..."
              className="w-full bg-dunkirk-dark border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-dunkirk-gold transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Importance de la sauvegarde des données
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'indispensable', label: 'Indispensable', color: 'border-rose-500 text-rose-300 bg-rose-500/10' },
                  { id: 'souhaitable', label: 'Souhaitable', color: 'border-amber-500 text-amber-300 bg-amber-500/10' },
                  { id: 'aucune_sans_importance', label: 'Sans importance', color: 'border-slate-600 text-slate-400 bg-slate-800/40' },
                ].map(({ id, label, color }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSauvegardeDonnees(id as DataPriority)}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold text-center transition ${
                      sauvegardeDonnees === id
                        ? color + ' shadow-sm'
                        : 'border-slate-800 text-slate-400 bg-dunkirk-dark hover:bg-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Dossiers critiques à préserver (si applicable)
              </label>
              <input
                type="text"
                value={dossiersCruciaux}
                onChange={(e) => setDossiersCruciaux(e.target.value)}
                placeholder="Ex: Bureau, Photos famille, Comptabilité C:\EBP..."
                className="w-full bg-dunkirk-dark border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-dunkirk-gold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5 : URGENCE, ACOMPTE & SIGNATURE CLIENT */}
      <div className="bg-dunkirk-card p-6 sm:p-8 rounded-2xl border border-dunkirk-border shadow-lg">
        <div className="flex items-center space-x-3 pb-4 mb-6 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-dunkirk-gold/15 text-dunkirk-gold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">6. Modalités d&apos;Intervention & Accord Client</h3>
            <p className="text-xs text-slate-400">Délai souhaité, seuil budgétaire et signature</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Urgence */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Niveau d&apos;urgence</label>
            <div className="space-y-2">
              {[
                { id: 'standard', label: 'Standard (48h - 72h)', desc: 'Traitement en file normale' },
                { id: 'express', label: 'Express Prioritaire (24h)', desc: 'Prise en charge immédiate' },
                { id: 'devis_obligatoire', label: 'Devis préalable obligatoire', desc: 'Attendre accord avant frais' }
              ].map(({ id, label, desc }) => (
                <label
                  key={id}
                  className={`block p-3 rounded-xl border cursor-pointer transition ${
                    urgence === id
                      ? 'bg-dunkirk-navy border-dunkirk-gold text-white'
                      : 'bg-dunkirk-dark/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="radio"
                      name="urgence"
                      checked={urgence === id}
                      onChange={() => setUrgence(id as UrgencyLevel)}
                      className="text-dunkirk-gold focus:ring-0 bg-dunkirk-dark border-slate-700"
                    />
                    <div>
                      <div className="text-xs font-bold">{label}</div>
                      <div className="text-[11px] text-slate-400">{desc}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Budget & Acompte */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Budget maximum autorisé sans devis préalable (€ TTC)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={budgetMaxiSansDevis || ''}
                onChange={(e) => setBudgetMaxiSansDevis(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Ex: 150"
                className="w-full bg-dunkirk-dark border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-dunkirk-gold font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Permet de lancer immédiatement les réparations mineures sans délai.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Acompte réglé à la dépose (€ TTC)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={acompteVerse || ''}
                  onChange={(e) => setAcompteVerse(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0"
                  className="bg-dunkirk-dark border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-dunkirk-gold font-mono"
                />
                <select
                  value={modePaiementAcompte}
                  onChange={(e) => setModePaiementAcompte(e.target.value)}
                  className="bg-dunkirk-dark border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-dunkirk-gold"
                >
                  <option value="Carte Bancaire">Carte Bancaire</option>
                  <option value="Espèces">Espèces</option>
                  <option value="Virement">Virement</option>
                </select>
              </div>
            </div>
          </div>

          {/* Zone Signature Client sur Canvas */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-dunkirk-gold" />
                <span>Signature Client au comptoir</span>
              </label>
              {hasSigned && (
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1"
                >
                  <Eraser className="w-3 h-3" />
                  <span>Effacer</span>
                </button>
              )}
            </div>

            <div className="border border-slate-700 rounded-xl bg-dunkirk-dark overflow-hidden relative shadow-inner">
              <canvas
                ref={canvasRef}
                width={360}
                height={130}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[130px] cursor-crosshair touch-none"
              />
              {!hasSigned && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-500 text-xs italic">
                  Signer au doigt ou à la souris
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Accord des conditions générales */}
        <div className="p-4 rounded-xl bg-dunkirk-dark/70 border border-slate-800 text-xs text-slate-400 mb-6 space-y-2">
          <label className="flex items-start space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={accepteConditions}
              onChange={(e) => setAccepteConditions(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 bg-dunkirk-dark text-dunkirk-gold focus:ring-0"
            />
            <span className="text-slate-300 leading-relaxed">
              Le client atteste avoir pris connaissance des conditions générales de prise en charge SAV : le client reste seul responsable de la sauvegarde préalable de ses données. Dunkirk Informatique ne saurait être tenu responsable d’une perte fortuite de données consécutive à une panne matérielle sous-jacente. Matériel conservé 3 mois maximum après avis de mise à disposition (Loi du 31/12/1903).
            </span>
          </label>
        </div>

        {/* Boutons d'action finaux */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold bg-dunkirk-navy hover:bg-dunkirk-navyLight text-white border border-dunkirk-gold/60 hover:border-dunkirk-gold transition flex items-center justify-center space-x-2 shadow-md"
          >
            <Save className="w-4 h-4 text-dunkirk-gold" />
            <span>Enregistrer le Dossier SAV</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, true)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-dunkirk-gold to-dunkirk-goldHover hover:from-dunkirk-goldBright hover:to-dunkirk-gold text-dunkirk-dark shadow-gold-glow hover:shadow-gold-glow-lg transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <Printer className="w-4 h-4 text-dunkirk-dark" />
            <span>Enregistrer & Imprimer Fiche A4</span>
          </button>
        </div>

      </div>

    </form>
  );
}
