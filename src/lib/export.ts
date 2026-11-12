/**
 * Export and Print Utilities for Huilerie Jemai
 * Generates XLSX workbooks and handles PDF / Print rendering
 */
import * as XLSX from 'xlsx';
import { TankStockDetail, ClientStockSummary } from '../types/stock';
import { OliveReception, ProductionBatch, GrignonSale, PurchaseBatch, ExpenseItem } from '../types/production';

export function exportTanksToExcel(
  tanks: TankStockDetail[],
  companyName: string = 'HUILERIE JEMAI'
) {
  const rows = tanks.map(t => ({
    'Code Cuve': t.tank.code,
    'Désignation': t.tank.name,
    'Capacité (L)': t.tank.capacity,
    'Stock Actuel (L)': t.current_quantity,
    'Remplissage (%)': `${t.fill_percentage}%`,
    'Disponible (L)': t.remaining_capacity,
    'Statut': t.is_alert ? 'ALERTE SEUIL DÉPASSÉ' : 'NORMAL',
    'Nombre de Producteurs': t.clients_breakdown.length,
    'Détail Producteurs': t.clients_breakdown.map(c => `${c.party_name} (${c.quantity}L)`).join('; ')
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Stock_Cuves');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${companyName.replace(/\s+/g, '_')}_Stock_Cuves_${dateStr}.xlsx`);
}

export function exportClientsToExcel(
  clients: ClientStockSummary[],
  companyName: string = 'HUILERIE JEMAI'
) {
  const rows = clients.map(c => ({
    'Code Client': c.party.code,
    'Nom Client': c.party.name,
    'Téléphone': c.party.phone || '-',
    'Huile en Stock (L)': c.total_quantity,
    'Répartition par Cuve': c.tanks_distribution.map(td => `${td.tank_code}: ${td.quantity}L`).join('; '),
    'Total Opérations': c.total_operations,
    'Dernier Mouvement': c.last_operation_date ? new Date(c.last_operation_date).toLocaleDateString('fr-TN') : '-'
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Stock_Clients');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${companyName.replace(/\s+/g, '_')}_Stock_Clients_${dateStr}.xlsx`);
}

export function exportOliveReceptionsToExcel(
  receptions: OliveReception[],
  companyName: string = 'HUILERIE JEMAI'
) {
  const rows = receptions.map(r => ({
    'N° Ticket': r.ticket_number,
    'Date': new Date(r.date).toLocaleString('fr-TN'),
    'Client / Producteur': r.party_name,
    'Variété': r.olive_variety,
    'Caisses / Sacs': r.boxes_count,
    'Poids Brut (KG)': r.gross_weight_kg,
    'Tare (KG)': r.tare_weight_kg,
    'Poids Net (KG)': r.net_weight_kg,
    'Qualité': r.quality,
    'Statut': r.status,
    'Opérateur': r.operator,
    'Notes': r.notes || ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Receptions_Olives');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${companyName.replace(/\s+/g, '_')}_Receptions_Olives_${dateStr}.xlsx`);
}

export function exportProductionToExcel(
  batches: ProductionBatch[],
  companyName: string = 'HUILERIE JEMAI'
) {
  const rows = batches.map(b => ({
    'N° Bon Trituration': b.ticket_number,
    'N° Réception': b.reception_ticket,
    'Producteur': b.party_name,
    'Olives Net (KG)': b.olives_net_kg,
    'Ligne de Presse': b.press_line,
    'Huile Produite (KG)': b.oil_quantity_kg,
    'Huile Produite (L)': b.oil_quantity_litres,
    'Densité': b.oil_density,
    'Rendement (%)': `${b.yield_percentage.toFixed(2)}%`,
    'Rendement (L / 100 KG)': b.yield_litres_per_100kg.toFixed(2),
    'Grignons Estimés (KG)': b.grignons_estimated_kg,
    'Frais Trituration (TND)': b.milling_fee_total_tnd.toFixed(3),
    'Mode Règlement': b.milling_fee_mode,
    'Frais Payés': b.milling_fee_paid ? 'OUI' : 'NON',
    'Destination Huile': b.oil_destination,
    'Confirmé': b.is_confirmed ? 'OUI (VERROUILLÉ)' : 'NON',
    'Opérateur': b.operator,
    'Date': new Date(b.started_at).toLocaleString('fr-TN')
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Trituration_Production');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${companyName.replace(/\s+/g, '_')}_Trituration_${dateStr}.xlsx`);
}

export function exportGrignonsToExcel(
  sales: GrignonSale[],
  companyName: string = 'HUILERIE JEMAI'
) {
  const rows = sales.map(s => ({
    'N° Bon Vente': s.doc_number,
    'Date': new Date(s.date).toLocaleString('fr-TN'),
    'Acheteur': s.buyer_name,
    'Matricule Camion': s.truck_plate,
    'Chauffeur': s.driver_name || '-',
    'Poids Brut (KG)': s.gross_weight_kg,
    'Tare (KG)': s.tare_weight_kg,
    'Poids Net (KG)': s.net_weight_kg,
    'Poids Net (Tonnes)': s.net_weight_tonnes,
    'Prix / Tonne (TND)': s.unit_price_per_tonne_tnd,
    'Total TND': s.total_price_tnd.toFixed(3),
    'Mode Paiement': s.payment_mode,
    'Statut': s.payment_status,
    'Opérateur': s.operator
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ventes_Grignons');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${companyName.replace(/\s+/g, '_')}_Ventes_Grignons_${dateStr}.xlsx`);
}

export function exportPurchasesToExcel(
  purchases: PurchaseBatch[],
  companyName: string = 'HUILERIE JEMAI'
) {
  const rows = purchases.map(p => ({
    'N° Bon Achat': p.doc_number,
    'Date': new Date(p.date).toLocaleString('fr-TN'),
    'Fournisseur': p.supplier_name,
    'Téléphone': p.supplier_phone || '-',
    'Type Produit': p.item_type,
    'Variété': p.variety || '-',
    'Quantité': p.quantity,
    'Unité': p.item_type === 'OLIVES' ? 'KG' : 'L',
    'Prix Unitaire (TND)': p.unit_price_tnd.toFixed(3),
    'Total (TND)': p.total_price_tnd.toFixed(3),
    'Mode Paiement': p.payment_mode,
    'Statut': p.payment_status,
    'Opérateur': p.operator,
    'Notes': p.notes || ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Achats_Huilerie');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${companyName.replace(/\s+/g, '_')}_Achats_Huilerie_${dateStr}.xlsx`);
}

export function exportFinancesToExcel(
  millingTotalTnd: number,
  grignonTotalTnd: number,
  purchasesTotalTnd: number,
  expenses: ExpenseItem[],
  companyName: string = 'HUILERIE JEMAI'
) {
  const summaryRows = [
    { 'Poste': 'Recettes Mouture (Espèces)', 'Montant (TND)': millingTotalTnd },
    { 'Poste': 'Recettes Ventes Grignons', 'Montant (TND)': grignonTotalTnd },
    { 'Poste': 'Achats Olives & Huile', 'Montant (TND)': -purchasesTotalTnd },
    { 'Poste': 'Charges d’Exploitation Totales', 'Montant (TND)': -expenses.reduce((a, b) => a + b.amount_tnd, 0) },
    { 'Poste': 'SOLDE NET DE CAISSE', 'Montant (TND)': millingTotalTnd + grignonTotalTnd - purchasesTotalTnd - expenses.reduce((a, b) => a + b.amount_tnd, 0) }
  ];

  const expenseRows = expenses.map(e => ({
    'Date': new Date(e.date).toLocaleDateString('fr-TN'),
    'Catégorie': e.category,
    'Libellé': e.label,
    'Bénéficiaire': e.beneficiary || '-',
    'Mode Règlement': e.payment_mode,
    'Montant (TND)': e.amount_tnd.toFixed(3)
  }));

  const wb = XLSX.utils.book_new();
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  const wsExpenses = XLSX.utils.json_to_sheet(expenseRows);

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Bilan_Financier');
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'Detail_Depenses');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${companyName.replace(/\s+/g, '_')}_Finances_Caisse_${dateStr}.xlsx`);
}

