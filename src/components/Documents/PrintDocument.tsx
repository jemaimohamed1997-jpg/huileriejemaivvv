import React from 'react';
import { Printer, X, Download } from 'lucide-react';
import { AppSettings, Operation, Tank, Party } from '../../types/stock';
import { OliveReception, ProductionBatch, GrignonSale } from '../../types/production';

export type PrintableDocType =
  | 'STOCK_IN'
  | 'STOCK_OUT'
  | 'STOCK_TRANSFER'
  | 'OLIVE_RECEPTION'
  | 'PRODUCTION_TICKET'
  | 'GRIGNON_SALE'
  | 'PURCHASE_RECEIPT'
  | 'CLIENT_STATEMENT';

interface PrintDocumentProps {
  docType: PrintableDocType;
  settings: AppSettings;
  data: any;
  onClose: () => void;
}

export const PrintDocument: React.FC<PrintDocumentProps> = ({
  docType,
  settings,
  data,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-stone-900 rounded-xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Toolbar (hidden in print) */}
        <div className="no-print bg-stone-900 text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Printer className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-sm">
              Aperçu avant impression (Format A4 Officiel)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="allow-print inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-xs rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Imprimer / Sauvegarder PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet */}
        <div className="p-8 sm:p-12 overflow-y-auto bg-white" id="printable-area">
          {/* Header */}
          <div className="border-b-2 border-stone-800 pb-5 mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-stone-900">
                {settings.company_name}
              </h1>
              <p className="text-base font-arabic font-bold text-amber-700 mt-0.5" dir="rtl">
                {settings.arabic_subtitle}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                {settings.address} · Tél: {settings.phone}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-stone-100 border border-stone-300 font-mono text-xs font-bold rounded text-stone-800">
                {data.doc_number || data.ticket_number || 'BON-OFFICIEL'}
              </span>
              <p className="text-xs text-stone-500 mt-1 font-mono">
                Date: {new Date(data.date || data.operation_date || data.started_at || Date.now()).toLocaleDateString('fr-TN')}
              </p>
            </div>
          </div>

          {/* Document Content Based on Type */}
          {docType === 'STOCK_IN' && renderStockOperation(data, 'BON DE RÉCEPTION D’HUILE (ENTRÉE STOCK)', 'وصل إيداع زيت')}
          {docType === 'STOCK_OUT' && renderStockOperation(data, 'BON DE SORTIE D’HUILE (RETRAIT STOCK)', 'وصل تسليم زيت')}
          {docType === 'STOCK_TRANSFER' && renderStockTransfer(data)}
          {docType === 'OLIVE_RECEPTION' && renderOliveReception(data)}
          {docType === 'PRODUCTION_TICKET' && renderProductionTicket(data)}
          {docType === 'GRIGNON_SALE' && renderGrignonSale(data)}
          {docType === 'PURCHASE_RECEIPT' && renderPurchaseReceipt(data)}
          {docType === 'CLIENT_STATEMENT' && renderClientStatement(data)}

          {/* Footer & Signatures */}
          <div className="mt-12 pt-6 border-t border-stone-200">
            <div className="grid grid-cols-2 gap-8 text-center text-xs">
              <div className="border border-stone-200 rounded-lg p-4 h-28 flex flex-col justify-between">
                <span className="font-semibold text-stone-700">Signature du Client / Producteur</span>
                <span className="text-[10px] text-stone-400 font-arabic">توقيع الفلاح / الحريف</span>
              </div>
              <div className="border border-stone-200 rounded-lg p-4 h-28 flex flex-col justify-between">
                <span className="font-semibold text-stone-700">Cachet & Signature Huilerie Jemai</span>
                <span className="text-[10px] text-stone-400 font-arabic">ختم وتوقيع المعصرة</span>
              </div>
            </div>
            <div className="mt-6 text-center text-[10px] text-stone-400 font-mono">
              Document généré par Huilerie Jemai ERP · Système certifié de gestion oléicole
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function renderStockOperation(op: any, titleFr: string, titleAr: string) {
  return (
    <div className="space-y-6">
      <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">{titleFr}</h2>
          <p className="text-xs font-arabic font-bold text-amber-700" dir="rtl">{titleAr}</p>
        </div>
        <div className="text-right">
          <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded ${op.status === 'VALIDE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
            {op.status === 'VALIDE' ? 'Validé' : 'Annulé'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="p-3 bg-stone-50 rounded border border-stone-200">
          <span className="text-stone-500 block">Producteur / Client:</span>
          <span className="font-bold text-sm text-stone-900">{op.party_name || op.party_id}</span>
        </div>
        <div className="p-3 bg-stone-50 rounded border border-stone-200">
          <span className="text-stone-500 block">Opérateur responsable:</span>
          <span className="font-medium text-stone-800">{op.operator || 'Mohamed Jemai'}</span>
        </div>
      </div>

      <div className="border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-100 border-b border-stone-200 text-stone-700">
            <tr>
              <th className="p-3">Cuve Affectée</th>
              <th className="p-3">Mouvement</th>
              <th className="p-3 text-right">Quantité (Litres)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {op.movements && op.movements.length > 0 ? (
              op.movements.map((m: any, idx: number) => (
                <tr key={idx}>
                  <td className="p-3 font-medium">{m.tank_code || m.tank_id}</td>
                  <td className="p-3 text-stone-600">{m.direction === 'IN' ? 'Entrée (+)' : 'Sortie (-)'}</td>
                  <td className="p-3 text-right font-mono font-bold">{m.quantity} L</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-3 font-medium">Cuve assignée</td>
                <td className="p-3 text-stone-600">{op.type === 'ENTREE' ? 'Entrée (+)' : 'Sortie (-)'}</td>
                <td className="p-3 text-right font-mono font-bold">{op.total_quantity} L</td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-stone-50 font-bold border-t border-stone-200">
            <tr>
              <td colSpan={2} className="p-3 text-stone-800">Total Général :</td>
              <td className="p-3 text-right font-mono text-sm text-amber-900">{op.total_quantity} L</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {op.notes && (
        <div className="p-3 bg-stone-50 rounded border border-stone-200 text-xs">
          <span className="font-semibold text-stone-700 block mb-1">Observations :</span>
          <p className="text-stone-600">{op.notes}</p>
        </div>
      )}
    </div>
  );
}

function renderStockTransfer(op: any) {
  return (
    <div className="space-y-6">
      <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">BON DE TRANSFERT INTER-CUVES</h2>
          <p className="text-xs font-arabic font-bold text-amber-700" dir="rtl">وصل تحويل داخلي بين الخزانات</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="p-3 bg-stone-50 rounded border border-stone-200">
          <span className="text-stone-500 block">Cuve Source (Origine):</span>
          <span className="font-bold text-sm text-stone-900">{op.source_tank_code || 'Cuve Source'}</span>
        </div>
        <div className="p-3 bg-stone-50 rounded border border-stone-200">
          <span className="text-stone-500 block">Cuve Destination (Réceptrice):</span>
          <span className="font-bold text-sm text-stone-900">{op.target_tank_code || 'Cuve Destination'}</span>
        </div>
      </div>
      <div className="p-4 bg-amber-50 rounded border border-amber-200 text-center">
        <span className="text-xs text-amber-800 uppercase block font-semibold">Volume Transféré</span>
        <span className="font-mono text-2xl font-black text-amber-900">{op.total_quantity} Litres</span>
      </div>
    </div>
  );
}

function renderOliveReception(rec: OliveReception) {
  return (
    <div className="space-y-6">
      <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">TICKET DE RÉCEPTION & PESÉE OLIVES</h2>
          <p className="text-xs font-arabic font-bold text-amber-700" dir="rtl">تذكرة وزن واستلام الزيتون</p>
        </div>
        <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
          {rec.status}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-stone-50 rounded border border-stone-200">
          <span className="text-stone-500 block">Producteur / Fellaḥ:</span>
          <span className="font-bold text-stone-900">{rec.party_name}</span>
        </div>
        <div className="p-3 bg-stone-50 rounded border border-stone-200">
          <span className="text-stone-500 block">Variété:</span>
          <span className="font-bold text-stone-900">{rec.olive_variety}</span>
        </div>
        <div className="p-3 bg-stone-50 rounded border border-stone-200">
          <span className="text-stone-500 block">Nombre Caisses / Sacs:</span>
          <span className="font-bold text-stone-900">{rec.boxes_count} unités</span>
        </div>
      </div>

      <div className="bg-stone-50 rounded-lg border border-stone-200 p-4">
        <h3 className="font-bold text-xs uppercase text-stone-700 mb-3 tracking-wider">Résultats de la Pesée</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white rounded border border-stone-200">
            <span className="text-[11px] text-stone-500 block">Poids Brut</span>
            <span className="font-mono font-bold text-stone-800 text-base">{rec.gross_weight_kg} KG</span>
          </div>
          <div className="p-3 bg-white rounded border border-stone-200">
            <span className="text-[11px] text-stone-500 block">Tare Déduite</span>
            <span className="font-mono font-bold text-stone-600 text-base">{rec.tare_weight_kg} KG</span>
          </div>
          <div className="p-3 bg-amber-50 rounded border border-amber-300">
            <span className="text-[11px] text-amber-800 block font-bold">Poids Net d'Olives</span>
            <span className="font-mono font-black text-amber-900 text-lg">{rec.net_weight_kg} KG</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="p-3 bg-stone-50 rounded border border-stone-200">
          <span className="text-stone-500 block">Qualité constatée:</span>
          <span className="font-semibold text-stone-900">{rec.quality}</span>
        </div>
        <div className="p-3 bg-stone-50 rounded border border-stone-200">
          <span className="text-stone-500 block">Opérateur de bascule:</span>
          <span className="font-semibold text-stone-900">{rec.operator}</span>
        </div>
      </div>
    </div>
  );
}

function renderProductionTicket(batch: ProductionBatch) {
  return (
    <div className="space-y-6">
      <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">BON DE TRITURATION & RENDEMENT D'HUILE</h2>
          <p className="text-xs font-arabic font-bold text-amber-700" dir="rtl">وصل عصر الزيتون واحتساب المردود</p>
        </div>
        <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
          {batch.is_confirmed ? 'CONFIRMÉ & VERROUILLÉ' : 'EN COURS'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-stone-50 rounded border border-stone-200">
          <span className="text-stone-500 block">Producteur:</span>
          <span className="font-bold text-stone-900">{batch.party_name}</span>
        </div>
        <div className="p-3 bg-stone-50 rounded border border-stone-200">
          <span className="text-stone-500 block">Ligne de Trituration:</span>
          <span className="font-semibold text-stone-900">{batch.press_line}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 bg-white rounded border border-stone-200">
          <span className="text-[10px] text-stone-500 block">Olives Net</span>
          <span className="font-mono font-bold text-stone-900 text-sm">{batch.olives_net_kg} KG</span>
        </div>
        <div className="p-3 bg-amber-50 rounded border border-amber-300">
          <span className="text-[10px] text-amber-800 font-bold block">Huile en Litres</span>
          <span className="font-mono font-black text-amber-900 text-base">{batch.oil_quantity_litres} L</span>
        </div>
        <div className="p-3 bg-emerald-50 rounded border border-emerald-300">
          <span className="text-[10px] text-emerald-800 font-bold block">Rendement %</span>
          <span className="font-mono font-black text-emerald-900 text-base">{batch.yield_percentage.toFixed(2)} %</span>
        </div>
        <div className="p-3 bg-white rounded border border-stone-200">
          <span className="text-[10px] text-stone-500 block">L / 100 KG</span>
          <span className="font-mono font-bold text-stone-900 text-sm">{batch.yield_litres_per_100kg.toFixed(2)} L</span>
        </div>
      </div>

      <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 text-xs space-y-2">
        <div className="flex justify-between">
          <span className="text-stone-600">Huile produite en Kilogrammes :</span>
          <span className="font-mono font-bold text-stone-900">{batch.oil_quantity_kg} KG (Densité: {batch.oil_density})</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-600">Grignons (Faytous) estimés :</span>
          <span className="font-mono font-bold text-stone-800">{batch.grignons_estimated_kg} KG</span>
        </div>
        <div className="flex justify-between border-t border-stone-200 pt-2 font-bold">
          <span className="text-stone-800">Frais de trituration ({batch.milling_fee_rate} TND/kg) :</span>
          <span className="font-mono text-amber-900 text-sm">{batch.milling_fee_total_tnd.toFixed(3)} TND ({batch.milling_fee_mode})</span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Destination de l'huile :</span>
          <span className="font-semibold text-stone-800">
            {batch.oil_destination === 'SORTIE_CLIENT' ? 'Enlèvement immédiat par le producteur' : batch.oil_destination === 'STOCKAGE_CUVE' ? `Déposée en Cuve (${batch.destination_tank_id || 'assignée'})` : 'En attente de décision'}
          </span>
        </div>
      </div>
    </div>
  );
}

function renderGrignonSale(sale: GrignonSale) {
  return (
    <div className="space-y-6">
      <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">BON DE VENTE DES GRIGNONS (فيتورة)</h2>
          <p className="text-xs font-arabic font-bold text-amber-700" dir="rtl">وصل بيع ونقل الفيتورة السائبة</p>
        </div>
        <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded ${sale.payment_status === 'PAYE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
          {sale.payment_status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-stone-50 rounded border border-stone-200">
          <span className="text-stone-500 block">Acheteur / Usine:</span>
          <span className="font-bold text-stone-900 text-sm">{sale.buyer_name}</span>
        </div>
        <div className="p-3 bg-stone-50 rounded border border-stone-200">
          <span className="text-stone-500 block">Matricule Camion / Chauffeur:</span>
          <span className="font-bold text-stone-900">{sale.truck_plate} {sale.driver_name ? `(${sale.driver_name})` : ''}</span>
        </div>
      </div>

      <div className="bg-stone-50 rounded-lg border border-stone-200 p-4">
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="p-2 bg-white rounded border border-stone-200">
            <span className="text-stone-500 block">Poids Brut</span>
            <span className="font-mono font-bold text-stone-800">{sale.gross_weight_kg} KG</span>
          </div>
          <div className="p-2 bg-white rounded border border-stone-200">
            <span className="text-stone-500 block">Tare Camion</span>
            <span className="font-mono font-bold text-stone-600">{sale.tare_weight_kg} KG</span>
          </div>
          <div className="p-2 bg-amber-50 rounded border border-amber-300">
            <span className="text-amber-800 block font-bold">Poids Net Chargé</span>
            <span className="font-mono font-black text-amber-900">{sale.net_weight_tonnes} Tonnes ({sale.net_weight_kg} KG)</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-amber-50/60 rounded-lg border border-amber-200 text-xs space-y-2">
        <div className="flex justify-between">
          <span className="text-stone-600">Prix unitaire convenu :</span>
          <span className="font-mono font-bold text-stone-900">{sale.unit_price_per_tonne_tnd.toFixed(3)} TND / Tonne</span>
        </div>
        <div className="flex justify-between border-t border-amber-200 pt-2 font-black text-sm text-amber-950">
          <span>Montant Total à Régler :</span>
          <span className="font-mono text-lg">{sale.total_price_tnd.toFixed(3)} TND</span>
        </div>
        <div className="flex justify-between text-stone-600 pt-1">
          <span>Mode de règlement :</span>
          <span className="font-semibold text-stone-800">{sale.payment_mode}</span>
        </div>
      </div>
    </div>
  );
}

function renderClientStatement(clientSummary: any) {
  return (
    <div className="space-y-6">
      <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
        <h2 className="text-lg font-bold text-stone-900">RELEVÉ DE COMPTE PRODUCTEUR</h2>
        <p className="text-xs font-arabic font-bold text-amber-700" dir="rtl">كشف حساب الفلاح - معصرة جماعي</p>
        <p className="text-xs text-stone-600 mt-1">Client: <strong>{clientSummary.party_name}</strong> (Code: {clientSummary.party_code})</p>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div className="p-3 bg-white rounded border border-stone-200">
          <span className="text-stone-500 block">Total Olives Apportées</span>
          <span className="font-mono font-bold text-stone-900">{clientSummary.total_olives_kg || 0} KG</span>
        </div>
        <div className="p-3 bg-amber-50 rounded border border-amber-200">
          <span className="text-amber-800 font-bold block">Huile Totale Extraite</span>
          <span className="font-mono font-black text-amber-900">{clientSummary.total_oil_litres || 0} L</span>
        </div>
        <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
          <span className="text-emerald-800 font-bold block">Rendement Moyen</span>
          <span className="font-mono font-black text-emerald-900">{clientSummary.average_yield_percent?.toFixed(2) || '0.00'} %</span>
        </div>
      </div>
    </div>
  );
}

function renderPurchaseReceipt(purchase: any) {
  return (
    <div className="space-y-6">
      <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">BON D'ACHAT DIRECT (COMPTE HUILERIE)</h2>
          <p className="text-xs font-arabic font-bold text-amber-700" dir="rtl">وصل شراء لحساب المعصرة</p>
        </div>
        <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded ${purchase.payment_status === 'PAYE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
          {purchase.payment_status === 'PAYE' ? 'Payé' : 'Impayé'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-stone-50 rounded border border-stone-200">
          <span className="text-stone-500 block">Fournisseur / Agriculteur:</span>
          <span className="font-bold text-stone-900 text-sm">{purchase.supplier_name}</span>
          {purchase.supplier_phone && <span className="text-stone-500 block text-[11px]">{purchase.supplier_phone}</span>}
        </div>
        <div className="p-3 bg-stone-50 rounded border border-stone-200">
          <span className="text-stone-500 block">Type de Produit & Variété:</span>
          <span className="font-bold text-stone-900">
            {purchase.item_type === 'OLIVES' ? `Olives en Vrac (${purchase.variety || 'Standard'})` : 'Huile d’Olive en Vrac'}
          </span>
        </div>
      </div>

      <div className="bg-stone-50 rounded-lg border border-stone-200 p-4">
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="p-2 bg-white rounded border border-stone-200">
            <span className="text-stone-500 block">Quantité Achetée</span>
            <span className="font-mono font-bold text-stone-900 text-sm">
              {purchase.quantity} {purchase.item_type === 'OLIVES' ? 'KG' : 'L'}
            </span>
          </div>
          <div className="p-2 bg-white rounded border border-stone-200">
            <span className="text-stone-500 block">Prix Unitaire Convenu</span>
            <span className="font-mono font-bold text-stone-800">
              {purchase.unit_price_tnd?.toFixed(3)} TND
            </span>
          </div>
          <div className="p-2 bg-amber-50 rounded border border-amber-300">
            <span className="text-amber-800 block font-bold">Montant Total à Payer</span>
            <span className="font-mono font-black text-amber-900 text-sm">
              {purchase.total_price_tnd?.toFixed(3)} TND
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs flex justify-between items-center">
        <div>
          <span className="text-stone-500">Mode de paiement: </span>
          <span className="font-bold text-stone-800">{purchase.payment_mode}</span>
        </div>
        {purchase.notes && (
          <div className="text-stone-600 italic">
            Obs: {purchase.notes}
          </div>
        )}
      </div>
    </div>
  );
}

