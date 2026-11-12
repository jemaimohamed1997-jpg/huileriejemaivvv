/**
 * Service de Partage Professionnel et Génération PDF des Bons Officiels
 * Huilerie Jemai (معصرة جماعي)
 * Compatible WhatsApp, Messenger, Email, Web Share API natif mobile et téléchargement PDF A4
 */

// @ts-ignore
import html2pdf from 'html2pdf.js';
import { Movement, Client, Cuve, AppSettings } from '../types';

export interface ShareOptions {
  movement: Movement;
  client?: Client;
  cuve?: Cuve;
  settings: AppSettings;
  elementId?: string;
}

/**
 * Génère le texte officiel récapitulatif du bon d'entrée ou de sortie
 */
export function buildReceiptShareSummary(movement: Movement, client?: Client, cuve?: Cuve, settings?: AppSettings): string {
  const isEntree = movement.typeMouvement === 'ENTREE';
  const isSortie = movement.typeMouvement === 'SORTIE';
  const typeLabel = isEntree ? "RÉCEPTION D'HUILE D'OLIVE (إدخال زيت)" :
                    isSortie ? "BON DE LIVRAISON / SORTIE (إخراج زيت)" :
                    movement.typeMouvement;

  const dateStr = new Date(movement.dateMouvement).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const timeStr = new Date(movement.dateMouvement).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const enterprise = settings?.nomEntreprise || "HUILERIE JEMAI";
  const enterpriseArabic = settings?.sousTitreArabe || "معصرة جماعي لإنتاج وتخزين زيت الزيتون";

  return `🫒 *${enterprise}*
*${enterpriseArabic}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 *${typeLabel}*
📌 *N° Bon :* ${movement.numeroBon}
📅 *Date :* ${dateStr} à ${timeStr}
👤 *Client / Producteur :* ${client?.nomComplet || 'Client'} (${client?.codeClient || 'CLI'})
🏢 *Pile / Cuve :* ${cuve?.numero || 'P-00'} - ${cuve?.nom || 'Cuve Inox'}
⚖️ *Quantité :* *${movement.quantite.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Litres*
${movement.observations ? `📝 *Observations :* ${movement.observations}\n` : ''}${movement.motif ? `📋 *Motif :* ${movement.motif}\n` : ''}👨‍💼 *Opérateur responsable :* ${movement.utilisateur}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Document officiel infalsifiable généré par Huilerie Jemai.`;
}

/**
 * Génère et télécharge le fichier PDF au format A4 du bon affiché
 */
export async function downloadReceiptPDF(elementId: string, filename: string): Promise<Blob | null> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error("Élément introuvable pour la génération PDF :", elementId);
    return null;
  }

  const opt = {
    margin: 8,
    filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      logging: false,
      backgroundColor: '#ffffff'
    },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
  };

  try {
    // 1. Déclenche le téléchargement du fichier pour l'utilisateur
    await html2pdf().set(opt).from(element).save();

    // 2. Génère également le Blob pour le partage natif (navigator.share files)
    const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
    return pdfBlob;
  } catch (err) {
    console.error("Erreur lors de la génération PDF :", err);
    return null;
  }
}

/**
 * Ouvre le partage WhatsApp avec le texte du bon
 */
export function shareViaWhatsApp(text: string, phone?: string): void {
  const encoded = encodeURIComponent(text);
  // Si le client a un numéro de téléphone tunisien valide, l'utiliser sinon ouvrir le sélecteur WhatsApp
  let cleanPhone = phone ? phone.replace(/[^\d+]/g, '') : '';
  if (cleanPhone.startsWith('00')) cleanPhone = cleanPhone.substring(2);
  if (cleanPhone.startsWith('+')) cleanPhone = cleanPhone.substring(1);

  const url = cleanPhone && cleanPhone.length >= 8 
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
    : `https://api.whatsapp.com/send?text=${encoded}`;

  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Ouvre le partage Facebook Messenger
 */
export function shareViaMessenger(text: string): void {
  // Messenger autorise le partage de liens ou texte via l'API dialog
  const encoded = encodeURIComponent(text);
  const url = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(window.location.origin)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(window.location.href)}`;
  
  // Alternative pratique : copier dans le presse-papier et ouvrir Messenger
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
  window.open(`https://www.messenger.com/t/`, '_blank', 'noopener,noreferrer');
}

/**
 * Ouvre le client Email par défaut avec Sujet et Corps pré-remplis
 */
export function shareViaEmail(movement: Movement, summaryText: string, clientEmail?: string): void {
  const isEntree = movement.typeMouvement === 'ENTREE';
  const subject = encodeURIComponent(`${isEntree ? "Bon d'Entrée" : "Bon de Sortie"} Huilerie Jemai - ${movement.numeroBon}`);
  const body = encodeURIComponent(summaryText);
  const target = clientEmail ? encodeURIComponent(clientEmail) : '';
  window.location.href = `mailto:${target}?subject=${subject}&body=${body}`;
}

/**
 * Déclenche le menu de partage natif (sur smartphone Android / iPhone) avec fichier ou texte
 */
export async function shareNatively(
  summaryText: string, 
  title: string, 
  pdfBlob?: Blob | null,
  filename: string = 'Bon_Officiel.pdf'
): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      // Si un Blob PDF est disponible et que navigator.canShare supporte les fichiers
      if (pdfBlob && navigator.canShare) {
        const file = new File([pdfBlob], filename, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title,
            text: summaryText,
            files: [file]
          });
          return true;
        }
      }

      // Partage texte direct si partage de fichier non supporté
      await navigator.share({
        title,
        text: summaryText,
        url: window.location.href
      });
      return true;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn("Échec du partage natif :", err);
      }
      return false;
    }
  }
  return false;
}
