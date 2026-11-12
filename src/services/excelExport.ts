/**
 * Huilerie Jemai (معصرة جماعي) - Exportateur Excel Professionnel (.xlsx)
 * Génération de classeurs formatés avec totaux, dates, et métadonnées.
 */

import * as XLSX from 'xlsx';
import { Movement, Cuve, Client } from '../types';

export function exporterSituationStockExcel(cuves: Cuve[], getCuveStock: (id: string) => number, nomHuilerie: string) {
  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const rows = cuves.map(c => {
    const stock = getCuveStock(c.id);
    const reste = Math.max(0, c.capaciteMax - stock);
    const taux = c.capaciteMax > 0 ? (stock / c.capaciteMax) * 100 : 0;

    return {
      "Numéro Pile": c.numero,
      "Désignation de la Cuve": c.nom,
      "Capacité Max (L)": c.capaciteMax,
      "Stock Actuel (L)": stock,
      "Capacité Restante (L)": reste,
      "Taux de Remplissage (%)": `${taux.toFixed(1)} %`,
      "Statut": c.active ? "En Service" : "Désactivée",
      "Notes & Emplacement": c.notes || ""
    };
  });

  const totalCap = cuves.reduce((acc, c) => acc + c.capaciteMax, 0);
  const totalStock = cuves.reduce((acc, c) => acc + getCuveStock(c.id), 0);
  const totalReste = Math.max(0, totalCap - totalStock);
  const tauxGlobal = totalCap > 0 ? (totalStock / totalCap) * 100 : 0;

  rows.push({
    "Numéro Pile": "TOTAL",
    "Désignation de la Cuve": "TOTAL GÉNÉRAL HUILERIE",
    "Capacité Max (L)": totalCap,
    "Stock Actuel (L)": totalStock,
    "Capacité Restante (L)": totalReste,
    "Taux de Remplissage (%)": `${tauxGlobal.toFixed(1)} %`,
    "Statut": "-",
    "Notes & Emplacement": `Inventaire arrêté le ${dateStr}`
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 14 },
    { wch: 32 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 22 },
    { wch: 14 },
    { wch: 35 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Situation des Cuves");

  XLSX.writeFile(workbook, `Huilerie_Jemai_Stock_Cuves_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exporterHistoriqueMouvementsExcel(mouvements: Movement[], clients: Client[], cuves: Cuve[]) {
  const clientMap = new Map(clients.map(c => [c.id, c.nomComplet]));
  const cuveMap = new Map(cuves.map(c => [c.id, `${c.numero} - ${c.nom}`]));

  const rows = mouvements.map(m => {
    return {
      "Numéro de Bon": m.numeroBon,
      "Date & Heure": new Date(m.dateMouvement).toLocaleString('fr-FR'),
      "Type d'Opération": m.typeMouvement,
      "Client / Déposant": clientMap.get(m.clientId) || "Inconnu",
      "Pile / Cuve": cuveMap.get(m.cuveId) || "Inconnue",
      "Quantité (Litres)": m.quantite,
      "Statut": m.estAnnule ? "ANNULÉ" : "VALIDÉ",
      "Opérateur": m.utilisateur,
      "Motif / Observations": m.motif || m.observations || "",
      "Motif Annulation": m.motifAnnulation || ""
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 20 },
    { wch: 20 },
    { wch: 18 },
    { wch: 32 },
    { wch: 30 },
    { wch: 18 },
    { wch: 12 },
    { wch: 18 },
    { wch: 35 },
    { wch: 30 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Registre des Mouvements");

  XLSX.writeFile(workbook, `Huilerie_Jemai_Registre_Mouvements_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exporterReleveClientExcel(client: Client, mouvementsClient: Movement[], cuves: Cuve[], soldeTotal: number) {
  const cuveMap = new Map(cuves.map(c => [c.id, `${c.numero} - ${c.nom}`]));

  const rows: Record<string, any>[] = mouvementsClient.map(m => {
    const isEntree = m.typeMouvement === 'ENTREE' || m.typeMouvement === 'TRANSFERT_ENTREE';
    return {
      "Numéro de Bon": m.numeroBon,
      "Date & Heure": new Date(m.dateMouvement).toLocaleString('fr-FR'),
      "Opération": m.typeMouvement as string,
      "Cuve": cuveMap.get(m.cuveId) || "Inconnue",
      "Entrée (L)": isEntree && !m.estAnnule ? m.quantite : "",
      "Sortie (L)": !isEntree && !m.estAnnule ? m.quantite : "",
      "Statut": m.estAnnule ? "ANNULÉ" : "VALIDÉ",
      "Observations": m.motif || m.observations || ""
    };
  });

  rows.push({
    "Numéro de Bon": "SOLDE FINAL",
    "Date & Heure": new Date().toLocaleString('fr-FR'),
    "Opération": "TOTAL EN STOCK",
    "Cuve": "Toutes Cuves",
    "Entrée (L)": "",
    "Sortie (L)": "",
    "Statut": `${soldeTotal.toFixed(1)} L`,
    "Observations": `Solde certifié Huilerie Jemai pour ${client.nomComplet}`
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 28 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 35 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Relevé ${client.codeClient}`);

  XLSX.writeFile(workbook, `Releve_${client.codeClient}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
