'use client';

import React, { useRef, useState } from 'react';
import { SAVTicket, STATUS_CONFIG, DEVICE_CATEGORIES } from '@/types/sav';
import { formatAccessoriesSummary, formatInspectionSummary } from '@/services/baserow';
import { Printer, Download, X, Loader2, Scissors } from 'lucide-react';

interface PrintableTicketProps {
  ticket: SAVTicket;
  onClose: () => void;
}

export default function PrintableTicket({ ticket, onClose }: PrintableTicketProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsGeneratingPdf(true);

    try {
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;

      const opt = {
        margin: [4, 4, 4, 4] as [number, number, number, number],
        filename: `Fiche-SAV-${ticket.id}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          width: 760,
          windowWidth: 760,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(printRef.current).save();
    } catch (err) {
      console.error('Erreur génération PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const status = STATUS_CONFIG[ticket.statut] || STATUS_CONFIG['depose'];
  const formattedDate = new Date(ticket.dateDepot).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible">
      {/* Barre d'outils flottante */}
      <div className="fixed top-3 right-4 z-50 flex items-center gap-2 print:hidden bg-slate-900/95 border border-slate-700 p-2 rounded-xl shadow-2xl backdrop-blur-md">
        <button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg shadow-lg text-xs disabled:opacity-50"
          title="Télécharger le fichier PDF"
        >
          {isGeneratingPdf ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{isGeneratingPdf ? 'Génération...' : 'Télécharger PDF'}</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs border border-slate-600"
          title="Imprimer directement"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Imprimer / PDF Windows</span>
        </button>

        <button
          onClick={onClose}
          className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs border border-slate-700"
        >
          <X className="w-4 h-4" />
          <span>Fermer</span>
        </button>
      </div>

      {/* DOCUMENT FICHE A4 LASER MONOCHROME */}
      <div
        ref={printRef}
        id="pdf-ticket-content"
        className="bg-white text-black print:m-0 print:p-0 print:shadow-none print:w-full print:max-w-none my-3 shadow-2xl font-sans"
        style={{
          width: '760px',
          minWidth: '760px',
          maxWidth: '760px',
          padding: '14px 18px',
          backgroundColor: '#ffffff',
          color: '#000000',
          boxSizing: 'border-box',
          border: '2px solid #000000',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}
      >
        {/* ============================================================ */}
        {/* VOLET 1 : REÇU CLIENT                                         */}
        {/* ============================================================ */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
          <tbody>
            <tr>
              {/* Gauche : Logo et coordonnées */}
              <td style={{ verticalAlign: 'top', paddingRight: '10px' }}>
                <table style={{ borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ verticalAlign: 'middle', width: '34px' }}>
                        <div style={{ width: '32px', height: '32px', backgroundColor: '#000000', color: '#ffffff', fontWeight: '900', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', lineHeight: '32px' }}>
                          DK
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'middle', paddingLeft: '8px' }}>
                        <div style={{ fontSize: '15px', fontWeight: '900', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#000000', lineHeight: '1.1' }}>
                          DUNKIRK INFORMATIQUE
                        </div>
                        <div style={{ fontSize: '9.5px', fontWeight: 'bold', color: '#000000', marginTop: '2px' }}>
                          Dépannage, Réparation, Maintenance & Assistance Informatique
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ fontSize: '9px', fontWeight: 'bold', marginTop: '5px', color: '#000000' }}>
                  <span>Tél : 03 39 91 26 59 / 07 43 01 22 24</span> &bull; <span>contact@dunkirkinformatique.fr</span> &bull; <span>Dunkerque & Flandres 7j/7</span>
                </div>
              </td>

              {/* Droite : Boîte N° Dossier */}
              <td style={{ width: '200px', verticalAlign: 'top', textAlign: 'center' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000000' }}>
                  <tbody>
                    <tr>
                      <td style={{ backgroundColor: '#000000', color: '#ffffff', fontWeight: '900', fontSize: '9px', textTransform: 'uppercase', padding: '2px 0' }}>
                        REÇU CLIENT - SAV
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: '900', padding: '3px 0' }}>
                        {ticket.id}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontSize: '8.5px', fontWeight: 'bold', borderTop: '1px solid #000000', padding: '2px 0' }}>
                        Déposé le {formattedDate}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* 2 Colonnes : Coordonnées Client & Matériel */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
          <tbody>
            <tr>
              {/* Client */}
              <td style={{ width: '50%', verticalAlign: 'top', paddingRight: '4px' }}>
                <div style={{ border: '1px solid #000000', height: '100%' }}>
                  <div style={{ backgroundColor: '#000000', color: '#ffffff', fontWeight: '900', fontSize: '9px', textTransform: 'uppercase', padding: '3px 6px' }}>
                    1. Coordonnées Client
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', padding: '6px', fontSize: '10px' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '75px', fontWeight: 'bold', padding: '2px 6px', verticalAlign: 'top' }}>Nom / Prénom :</td>
                        <td style={{ fontWeight: '900', padding: '2px 6px' }}>
                          {ticket.client.nom} {ticket.client.prenom} {ticket.client.societe && `(${ticket.client.societe})`}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '2px 6px', verticalAlign: 'top' }}>Téléphone :</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: '900', padding: '2px 6px', fontSize: '11px' }}>
                          {ticket.client.telephone}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '2px 6px', verticalAlign: 'top' }}>Email :</td>
                        <td style={{ padding: '2px 6px', wordBreak: 'break-all' }}>
                          {ticket.client.email || '-'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '2px 6px', verticalAlign: 'top' }}>Adresse :</td>
                        <td style={{ padding: '2px 6px' }}>
                          {ticket.client.adresse ? `${ticket.client.adresse}, ${ticket.client.codePostal || ''} ${ticket.client.ville || ''}` : 'Dunkerque & Flandres'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>

              {/* Matériel */}
              <td style={{ width: '50%', verticalAlign: 'top', paddingLeft: '4px' }}>
                <div style={{ border: '1px solid #000000', height: '100%' }}>
                  <div style={{ backgroundColor: '#000000', color: '#ffffff', fontWeight: '900', fontSize: '9px', textTransform: 'uppercase', padding: '3px 6px' }}>
                    2. Matériel & Accessoires Déposés
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', padding: '6px', fontSize: '10px' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '75px', fontWeight: 'bold', padding: '2px 6px', verticalAlign: 'top' }}>Catégorie :</td>
                        <td style={{ fontWeight: '900', padding: '2px 6px' }}>
                          {DEVICE_CATEGORIES[ticket.materiel.categorie] || ticket.materiel.categorie}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '2px 6px', verticalAlign: 'top' }}>Modèle :</td>
                        <td style={{ fontWeight: 'bold', padding: '2px 6px' }}>
                          {ticket.materiel.marque} {ticket.materiel.modele}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '2px 6px', verticalAlign: 'top' }}>N° Série :</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 'bold', padding: '2px 6px' }}>
                          {ticket.materiel.numeroSerie || 'Non renseigné'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '2px 6px', verticalAlign: 'top' }}>Accessoires :</td>
                        <td style={{ padding: '2px 6px', fontSize: '9.5px' }}>
                          {formatAccessoriesSummary(ticket.accessoires)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '2px 6px', verticalAlign: 'top' }}>État initial :</td>
                        <td style={{ padding: '2px 6px', fontSize: '9.5px' }}>
                          {formatInspectionSummary(ticket.etatVisuel)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Panne signalée */}
        <div style={{ border: '1px solid #000000', marginBottom: '8px' }}>
          <div style={{ backgroundColor: '#000000', color: '#ffffff', fontWeight: '900', fontSize: '9px', textTransform: 'uppercase', padding: '3px 6px' }}>
            3. Symptômes & Panne Déclarée par le Client
          </div>
          <div style={{ padding: '6px 8px', fontSize: '10px', minHeight: '34px', lineHeight: '1.3' }}>
            {ticket.demandeClient.descriptionPanne || 'Aucune description spécifique renseignée.'}
            {ticket.demandeClient.sauvegardeDonnees === 'indispensable' && (
              <div style={{ marginTop: '4px', border: '1px solid #000000', padding: '2px 5px', fontWeight: '900', fontSize: '8.5px', textTransform: 'uppercase', display: 'inline-block' }}>
                [ ! ] SAUVEGARDE PRÉALABLE DES DONNÉES DEMANDÉE IMPÉRATIVEMENT
              </div>
            )}
          </div>
        </div>

        {/* Conditions & Signature */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
          <tbody>
            <tr>
              {/* Conditions */}
              <td style={{ width: '70%', verticalAlign: 'top', paddingRight: '5px' }}>
                <div style={{ border: '1px solid #000000', padding: '5px 8px', fontSize: '8.5px', lineHeight: '1.25' }}>
                  <div style={{ fontWeight: '900', textTransform: 'uppercase', marginBottom: '2px' }}>
                    Conditions Générales de Prise en Charge :
                  </div>
                  <div>1. Tout matériel non réclamé sous 3 mois sera considéré comme abandonné (Loi du 31/12/1903).</div>
                  <div>2. Dunkirk Informatique décline toute responsabilité pour perte de données non sauvegardées préalablement.</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '3px', paddingTop: '3px', borderTop: '1px solid #000000', fontSize: '9px' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '50%', fontWeight: 'bold' }}>
                          Acompte versé : <strong>{ticket.conditions.acompteVerse || 0} € TTC</strong>
                        </td>
                        <td style={{ width: '50%', textAlign: 'right', fontWeight: 'bold' }}>
                          Seuil accord devis : <strong>{ticket.conditions.budgetMaxiSansDevis || 60} € TTC</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>

              {/* Signature */}
              <td style={{ width: '30%', verticalAlign: 'top', paddingLeft: '3px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000000', height: '68px' }}>
                  <tbody>
                    <tr>
                      <td style={{ height: '16px', fontSize: '8px', fontWeight: '900', textTransform: 'uppercase', textAlign: 'center', borderBottom: '1px solid #000000', backgroundColor: '#ffffff' }}>
                        Signature Client (Accord)
                      </td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '2px', height: '48px' }}>
                        {ticket.signatureClient ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={ticket.signatureClient}
                            alt="Signature"
                            style={{ maxHeight: '42px', maxWidth: '100%', margin: '0 auto', display: 'block', objectFit: 'contain' }}
                          />
                        ) : (
                          <div style={{ fontSize: '8.5px', fontStyle: 'italic', color: '#000000' }}>
                            Signature manuscrite
                          </div>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* LIGNE DE DÉCOUPE */}
        <div style={{ textAlign: 'center', margin: '8px 0', borderTop: '2px dashed #000000', position: 'relative' }}>
          <span style={{ position: 'relative', top: '-8px', backgroundColor: '#ffffff', padding: '0 8px', fontSize: '8px', fontWeight: '900', textTransform: 'uppercase', border: '1px solid #000000', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Scissors style={{ width: '10px', height: '10px' }} /> DÉCOUPER ICI &bull; REÇU CLIENT EN HAUT &bull; FICHE ATELIER EN BAS
          </span>
        </div>

        {/* ============================================================ */}
        {/* VOLET 2 : FICHE ATELIER / ROUTING TECHNIQUE                   */}
        {/* ============================================================ */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'middle' }}>
                <span style={{ border: '1px solid #000000', padding: '1px 5px', fontSize: '8.5px', fontWeight: '900', textTransform: 'uppercase' }}>
                  VOLET ATELIER & SUIVI TECHNIQUE
                </span>
                <div style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', marginTop: '2px' }}>
                  DOSSIER DE RÉPARATION #{ticket.id}
                </div>
              </td>
              {/* Boîte Statut & Casier : structurés en tableau fermé sans chevauchement */}
              <td style={{ width: '260px', textAlign: 'right', verticalAlign: 'middle' }}>
                <table style={{ borderCollapse: 'collapse', float: 'right' }}>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #000000', padding: '3px 8px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', textAlign: 'center' }}>
                        {status.label}
                      </td>
                      <td style={{ width: '6px' }}></td>
                      <td style={{ border: '2px solid #000000', padding: '3px 8px', fontSize: '11px', fontWeight: '900', fontFamily: 'monospace', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        CASIER #{ticket.id.slice(-4)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* 3 Boîtes atelier : Accès Système / Client Direct / Priorité */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
          <tbody>
            <tr>
              {/* Accès Système (Mot de passe en tableau bien calé) */}
              <td style={{ width: '33.33%', verticalAlign: 'top', paddingRight: '4px' }}>
                <div style={{ border: '1px solid #000000', padding: '5px 6px', height: '100%', boxSizing: 'border-box' }}>
                  <div style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '8.5px', borderBottom: '1px solid #000000', paddingBottom: '2px', marginBottom: '4px' }}>
                    Accès Système
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '70px', fontWeight: 'bold' }}>Session :</td>
                        <td>
                          <span style={{ border: '1px solid #000000', padding: '1px 4px', fontFamily: 'monospace', fontWeight: '900', fontSize: '10px' }}>
                            {ticket.materiel.motDePasseSession || 'AUCUN'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', paddingTop: '3px' }}>OS :</td>
                        <td style={{ paddingTop: '3px' }}>{ticket.materiel.systemeExploitation || 'Non spécifié'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>

              {/* Client Direct */}
              <td style={{ width: '33.33%', verticalAlign: 'top', paddingLeft: '2px', paddingRight: '2px' }}>
                <div style={{ border: '1px solid #000000', padding: '5px 6px', height: '100%', boxSizing: 'border-box' }}>
                  <div style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '8.5px', borderBottom: '1px solid #000000', paddingBottom: '2px', marginBottom: '4px' }}>
                    Client Direct
                  </div>
                  <div style={{ fontWeight: '900', fontSize: '10px' }}>{ticket.client.nom} {ticket.client.prenom}</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '11px', marginTop: '2px' }}>{ticket.client.telephone}</div>
                </div>
              </td>

              {/* Priorité & Budget */}
              <td style={{ width: '33.33%', verticalAlign: 'top', paddingLeft: '4px' }}>
                <div style={{ border: '1px solid #000000', padding: '5px 6px', height: '100%', boxSizing: 'border-box' }}>
                  <div style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '8.5px', borderBottom: '1px solid #000000', paddingBottom: '2px', marginBottom: '4px' }}>
                    Priorité & Plafond
                  </div>
                  <div style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '9.5px' }}>
                    {ticket.conditions.urgence === 'express' ? '[ ! ] EXPRESS (24/48H)' : 'Délai Standard'}
                  </div>
                  <div style={{ fontSize: '9px', marginTop: '2px' }}>
                    Plafond sans devis : <strong>{ticket.conditions.budgetMaxiSansDevis || 60} € TTC</strong>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Checklist Technicien */}
        <div style={{ border: '1px solid #000000', marginBottom: '8px' }}>
          <div style={{ backgroundColor: '#000000', color: '#ffffff', fontWeight: '900', fontSize: '8.5px', textTransform: 'uppercase', padding: '2px 6px' }}>
            Checklist Contrôle & Intervention Technique
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', padding: '4px', fontSize: '9px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '3px 6px', width: '25%' }}>[ {ticket.statut !== 'depose' ? 'X' : ' '} ] Prise en charge</td>
                <td style={{ padding: '3px 6px', width: '25%' }}>[ {['diagnostic', 'reparation', 'pret', 'restitue'].includes(ticket.statut) ? 'X' : ' '} ] Test alim / charge</td>
                <td style={{ padding: '3px 6px', width: '25%' }}>[ {['reparation', 'pret', 'restitue'].includes(ticket.statut) ? 'X' : ' '} ] Test RAM & Disque</td>
                <td style={{ padding: '3px 6px', width: '25%' }}>[ {['pret', 'restitue'].includes(ticket.statut) ? 'X' : ' '} ] Dépoussiérage</td>
              </tr>
              <tr>
                <td style={{ padding: '3px 6px' }}>[ {['pret', 'restitue'].includes(ticket.statut) ? 'X' : ' '} ] Scan antivirus</td>
                <td style={{ padding: '3px 6px' }}>[ {['pret', 'restitue'].includes(ticket.statut) ? 'X' : ' '} ] Mises à jour OS</td>
                <td style={{ padding: '3px 6px' }}>[ {['pret', 'restitue'].includes(ticket.statut) ? 'X' : ' '} ] Contrôle thermique</td>
                <td style={{ padding: '3px 6px' }}>[ {ticket.statut === 'restitue' ? 'X' : ' '} ] Nettoyage châssis</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Rapport d'Intervention & Montant € TTC (Calibré sans coupure ni chevauchement) */}
        <div style={{ border: '1px solid #000000', padding: '6px' }}>
          <div style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '8.5px', borderBottom: '1px solid #000000', paddingBottom: '2px', marginBottom: '3px' }}>
            Rapport d'Intervention / Pièces Remplacées / Observations Atelier :
          </div>
          <div style={{ minHeight: '34px', fontSize: '9.5px', lineHeight: '1.3', color: '#000000' }}>
            {ticket.rapportTechnique?.diagnosticTechnicien || '____________________________________________________________________________________________________\n____________________________________________________________________________________________________'}
          </div>
          {ticket.rapportTechnique?.piecesRemplacees && (
            <div style={{ marginTop: '2px', fontSize: '9px' }}>
              <strong>Pièces remplacées :</strong> {ticket.rapportTechnique.piecesRemplacees}
            </div>
          )}

          {/* Ligne finale : Technicien | Total Facturé € TTC | Signature */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '5px', paddingTop: '4px', borderTop: '1px solid #000000', fontSize: '9.5px' }}>
            <tbody>
              <tr>
                <td style={{ width: '33%', verticalAlign: 'bottom', whiteSpace: 'nowrap' }}>
                  Technicien : <strong>Dunkirk Informatique</strong>
                </td>

                {/* Total Facturé avec encadré dédié pour € TTC */}
                <td style={{ width: '34%', textAlign: 'center', verticalAlign: 'bottom', whiteSpace: 'nowrap' }}>
                  Total Facturé :{' '}
                  <span style={{ border: '1px solid #000000', padding: '2px 8px', fontFamily: 'monospace', fontWeight: '900', fontSize: '11px', display: 'inline-block' }}>
                    {ticket.rapportTechnique?.montantTotalTTC
                      ? `${ticket.rapportTechnique.montantTotalTTC} € TTC`
                      : '_____ € TTC'}
                  </span>
                </td>

                <td style={{ width: '33%', textAlign: 'right', verticalAlign: 'bottom', whiteSpace: 'nowrap' }}>
                  Signature Restitution : ________________
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
