import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  Download, 
  Droplet, 
  FileCheck, 
  ShieldCheck, 
  Share2,
  Mail,
  MessageCircle,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  FileText
} from 'lucide-react';
import { Movement, Client, Cuve, AppSettings } from '../types';
import { 
  buildReceiptShareSummary, 
  downloadReceiptPDF, 
  shareViaWhatsApp, 
  shareViaMessenger, 
  shareViaEmail, 
  shareNatively 
} from '../services/receiptShare';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  movement: Movement | null;
  clients: Client[];
  cuves: Cuve[];
  settings: AppSettings;
  isDuplicate?: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  movement,
  clients,
  cuves,
  settings,
  isDuplicate = false
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !movement) return null;

  const client = clients.find(c => c.id === movement.clientId);
  const cuve = cuves.find(c => c.id === movement.cuveId);

  const typeConfig: Record<string, { label: string; color: string; border: string }> = {
    ENTREE: {
      label: "BON DE RÉCEPTION D'HUILE D'OLIVE",
      color: "bg-emerald-800 text-white",
      border: "border-emerald-800"
    },
    SORTIE: {
      label: "BON DE LIVRAISON / SORTIE D'HUILE",
      color: "bg-amber-800 text-white",
      border: "border-amber-800"
    },
    TRANSFERT_SORTIE: {
      label: "BON DE TRANSFERT (SORTIE DE PILE)",
      color: "bg-sky-900 text-white",
      border: "border-sky-900"
    },
    TRANSFERT_ENTREE: {
      label: "BON DE TRANSFERT (ENTRÉE EN PILE)",
      color: "bg-sky-800 text-white",
      border: "border-sky-800"
    },
    ANNULATION: {
      label: "AVIS D'ANNULATION / CONTRE-PASSATION",
      color: "bg-red-800 text-white",
      border: "border-red-800"
    }
  };

  const currentType = typeConfig[movement.typeMouvement] || {
    label: "BON DE MOUVEMENT D'HUILE",
    color: "bg-stone-800 text-white",
    border: "border-stone-800"
  };

  const handlePrint = () => {
    window.print();
  };

  const summaryText = buildReceiptShareSummary(movement, client, cuve, settings);
  const pdfFilename = `${movement.numeroBon}_${client?.nomComplet ? client.nomComplet.replace(/[^a-zA-Z0-9]/g, '_') : 'Bon'}`;

  // 1. Partage natif smartphone
  const handleNativeShare = async () => {
    setIsGeneratingPdf(true);
    try {
      const blob = await downloadReceiptPDF('printable-voucher', pdfFilename);
      await shareNatively(summaryText, `${movement.numeroBon} - Huilerie Jemai`, blob, `${pdfFilename}.pdf`);
    } finally {
      setIsGeneratingPdf(false);
      setShowShareMenu(false);
    }
  };

  // 2. Téléchargement PDF
  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadReceiptPDF('printable-voucher', pdfFilename);
    } finally {
      setIsGeneratingPdf(false);
      setShowShareMenu(false);
    }
  };

  // 3. Partage WhatsApp
  const handleWhatsApp = () => {
    shareViaWhatsApp(summaryText, client?.telephone);
    setShowShareMenu(false);
  };

  // 4. Partage Messenger
  const handleMessenger = () => {
    shareViaMessenger(summaryText);
    setShowShareMenu(false);
  };

  // 5. Partage Email
  const handleEmail = () => {
    shareViaEmail(movement, summaryText);
    setShowShareMenu(false);
  };

  // 6. Copier le résumé
  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(movement.dateMouvement).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const formattedTime = new Date(movement.dateMouvement).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const hasNativeShare = typeof navigator !== 'undefined' && Boolean(navigator.share);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-300 flex flex-col my-auto max-h-[95vh] overflow-hidden">
        
        {/* Barre d'outils (Non imprimée) */}
        <div className="no-print bg-stone-900 text-white px-4 sm:px-5 py-3 flex items-center justify-between border-b border-stone-800 relative">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold tracking-wide">
              Aperçu du Bon Officiel &bull; <span className="font-mono">{movement.numeroBon}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Bouton WhatsApp direct sur mobile */}
            <button
              type="button"
              onClick={handleWhatsApp}
              className="sm:hidden inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow transition cursor-pointer active:scale-95"
              title="Envoyer sur WhatsApp"
            >
              <span>WhatsApp</span>
            </button>

            {/* Bouton Partager cliquable et visible */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow transition cursor-pointer active:scale-95"
                title="Partager ce bon via WhatsApp, Messenger, Email ou Menu Natif"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Partager</span>
              </button>

              {/* Menu Déroulant de Partage */}
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-stone-900 rounded-xl shadow-2xl border border-stone-700 py-1.5 z-50 text-xs text-stone-200">
                  <div className="px-3 py-1.5 border-b border-stone-800 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Partager le bon officiel
                  </div>

                  {hasNativeShare && (
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      disabled={isGeneratingPdf}
                      className="w-full text-left px-3.5 py-2 hover:bg-stone-800 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-bold text-white">Menu Natif Smartphone</div>
                        <div className="text-[10px] text-stone-400">WhatsApp, AirDrop, Messages...</div>
                      </div>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="w-full text-left px-3.5 py-2 hover:bg-stone-800 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold">W</span>
                    </div>
                    <div>
                      <div className="font-bold text-white">WhatsApp</div>
                      <div className="text-[10px] text-stone-400">
                        {client?.telephone ? `Vers ${client.telephone}` : "Ouvrir WhatsApp"}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleMessenger}
                    className="w-full text-left px-3.5 py-2 hover:bg-stone-800 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <MessageCircle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Facebook Messenger</div>
                      <div className="text-[10px] text-stone-400">Envoyer au client</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleEmail}
                    className="w-full text-left px-3.5 py-2 hover:bg-stone-800 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-bold text-white">Email</div>
                      <div className="text-[10px] text-stone-400">Ouvrir client de messagerie</div>
                    </div>
                  </button>

                  <div className="border-t border-stone-800 my-1"></div>

                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPdf}
                    className="w-full text-left px-3.5 py-2 hover:bg-stone-800 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Download className={`w-4 h-4 text-emerald-400 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
                    <div>
                      <div className="font-bold text-white">
                        {isGeneratingPdf ? "Génération PDF..." : "Télécharger en PDF A4"}
                      </div>
                      <div className="text-[10px] text-stone-400">Format certifié pour impression</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full text-left px-3.5 py-2 hover:bg-stone-800 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-stone-400" />}
                    <div>
                      <div className="font-bold text-white">{copied ? "Texte Copié !" : "Copier le Texte du Bon"}</div>
                      <div className="text-[10px] text-stone-400">Détails et récapitulatif complet</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-white rounded-lg text-xs font-bold shadow transition cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimer (A4)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>


        {/* Corps Imprimable (Adapté A4) */}
        <div id="printable-voucher" className="p-4 sm:p-8 bg-white text-stone-900 overflow-y-auto relative font-sans">
          
          {/* Filigrane Duplicata si réimpression ou annulé */}
          {(isDuplicate || movement.estAnnule) && (
            <div className="absolute right-4 sm:right-8 top-4 sm:top-8 rotate-[-8deg] border-2 border-dashed border-red-600 text-red-600 px-3 sm:px-4 py-1 sm:py-1.5 font-extrabold text-xs sm:text-sm uppercase tracking-widest bg-red-50/80 pointer-events-none z-10">
              {movement.estAnnule ? "ANNULÉ / CONTRE-PASSÉ" : "DUPLICATA DE RÉIMPRESSION"}
            </div>
          )}

          {/* En-tête Huilerie Jemai */}
          <div className="flex flex-col sm:flex-row items-start justify-between border-b-2 border-stone-800 pb-4 mb-4 gap-3 sm:gap-0">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center p-2 shrink-0">
                <Droplet className="w-full h-full fill-amber-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-950 uppercase">
                  {settings.nomEntreprise}
                </h1>
                <p className="text-sm font-bold text-amber-900 font-serif" dir="rtl">
                  {settings.sousTitreArabe}
                </p>
                <p className="text-[10px] text-stone-500 mt-0.5 leading-tight">
                  Extraction et stockage certifié d'huile d'olive &bull; {settings.adresse}<br />
                  Tél : {settings.contactTelephone} &bull; Registre des Piles Conforme
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">N° Bon Officiel</span>
              <span className="font-mono font-extrabold text-sm sm:text-base bg-stone-100 px-2.5 py-1 rounded border border-stone-300 inline-block text-stone-900">
                {movement.numeroBon}
              </span>
              <div className="text-[11px] text-stone-600 font-medium mt-1">
                Date : <strong>{formattedDate}</strong> à <strong>{formattedTime}</strong>
              </div>
            </div>
          </div>

          {/* Titre du document */}
          <div className={`${currentType.color} text-center py-2 px-4 rounded-md font-extrabold text-xs tracking-wider uppercase mb-4 sm:mb-5 shadow-xs`}>
            {currentType.label}
          </div>

          {/* Grille Informations Client et Cuve */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
            {/* Déposant */}
            <div className="bg-stone-50 p-3.5 rounded-lg border border-stone-200">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block border-b border-stone-200 pb-1 mb-2">
                Identité du Client / Déposant
              </span>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Code Client :</span>
                  <span className="font-mono font-bold text-stone-900">{client?.codeClient || 'CLI-000'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Nom / Raison :</span>
                  <span className="font-bold text-stone-900 text-right">{client?.nomComplet || 'Client Inconnu'}</span>
                </div>
                {client?.telephone && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Téléphone :</span>
                    <span className="font-medium text-stone-800">{client.telephone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cuve */}
            <div className="bg-stone-50 p-3.5 rounded-lg border border-stone-200">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block border-b border-stone-200 pb-1 mb-2">
                Emplacement de Stockage
              </span>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">N° Pile / Cuve :</span>
                  <span className="font-mono font-bold text-stone-900">{cuve?.numero || 'P-00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Désignation :</span>
                  <span className="font-bold text-stone-900 text-right">{cuve?.nom || 'Cuve Inox'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Opérateur :</span>
                  <span className="font-medium text-stone-800">{movement.utilisateur}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau Quantité Officielle */}
          <table className="w-full text-left text-xs border border-stone-300 rounded-lg overflow-hidden mb-5">
            <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[11px] border-b border-stone-300">
              <tr>
                <th className="py-2.5 px-4">Désignation</th>
                <th className="py-2.5 px-4">Pile Assignée</th>
                <th className="py-2.5 px-4 text-right">Quantité Officielle</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 px-4 font-medium">
                  <strong className="text-stone-900">Huile d'olive extra-vierge</strong>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    {movement.observations || movement.motif || "Conforme aux normes de pesée et de cuverie"}
                  </div>
                </td>
                <td className="py-4 px-4 font-medium text-stone-700">
                  {cuve?.numero} &bull; {cuve?.nom}
                </td>
                <td className="py-4 px-4 text-right font-mono">
                  <span className="text-2xl font-black text-emerald-800">
                    {movement.quantite.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-sm font-bold text-stone-800 ml-1.5">Litres (L)</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Motif d'annulation si annulé */}
          {movement.estAnnule && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 mb-5">
              <strong>Motif d'annulation :</strong> {movement.motifAnnulation}<br />
              <span className="text-[10px] text-red-700">
                Annulé le {new Date(movement.dateAnnulation || '').toLocaleString('fr-FR')} par {movement.utilisateurAnnulation}
              </span>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 mt-4 border-t border-dashed border-stone-300 text-xs">
            <div className="text-center">
              <span className="font-bold text-stone-700 block mb-1">Visa & Signature du Déposant</span>
              <p className="text-[10px] text-stone-400 italic mb-10">(Mention manuscrite "Lu et approuvé")</p>
              <div className="w-36 h-0.5 bg-stone-300 mx-auto"></div>
            </div>

            <div className="text-center">
              <span className="font-bold text-stone-700 block mb-1">Pour Huilerie Jemai (معصرة جماعي)</span>
              <p className="text-[10px] text-stone-400 italic mb-10">Cachet & Signature de l'Opérateur</p>
              <div className="w-36 h-0.5 bg-stone-300 mx-auto"></div>
            </div>
          </div>

          {/* Bas de page officiel */}
          <div className="text-center text-[10px] text-stone-400 mt-6 pt-3 border-t border-stone-100">
            Document officiel infalsifiable généré par le système de gestion de stock Huilerie Jemai.<br />
            Ce bon doit être présenté pour tout enlèvement, tirage ou transfert ultérieur d'huile.
          </div>

        </div>

      </div>
    </div>
  );
};
