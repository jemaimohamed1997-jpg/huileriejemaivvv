import React, { useState } from 'react';
import { Cog, Play, CheckCircle, Clock, Lock, Printer, FileSpreadsheet, AlertCircle, ArrowRight } from 'lucide-react';
import { OliveReception, ProductionBatch } from '../../types/production';
import { translations, Language } from '../../lib/i18n';

interface ProductionQueueProps {
  queueReceptions: OliveReception[]; // Receptions with status 'EN_FILE'
  productionBatches: ProductionBatch[];
  currentRole: 'admin' | 'operateur';
  lang: Language;
  onStartMilling: (reception: OliveReception) => void;
  onPrintBatch: (batch: ProductionBatch) => void;
  onExportExcel: () => void;
}

export const ProductionQueue: React.FC<ProductionQueueProps> = ({
  queueReceptions,
  productionBatches,
  currentRole,
  lang,
  onStartMilling,
  onPrintBatch,
  onExportExcel
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'COMPLETED'>('QUEUE');

  const totalOlivesInQueue = queueReceptions.reduce((sum, r) => sum + r.net_weight_kg, 0);
  const totalOilProduced = productionBatches.reduce((sum, b) => sum + b.oil_quantity_litres, 0);

  return (
    <div className="space-y-6">
      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-medium block">{t.queueWaiting}</span>
            <span className="font-mono text-2xl font-black text-amber-900">
              {queueReceptions.length} lots ({totalOlivesInQueue.toLocaleString()} KG)
            </span>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-medium block">Total Huile Extraite Confirmée</span>
            <span className="font-mono text-2xl font-black text-emerald-800">
              {totalOilProduced.toLocaleString()} Litres
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <Cog className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-medium block">Lots Confirmés & Verrouillés</span>
            <span className="font-mono text-2xl font-black text-stone-900">
              {productionBatches.filter(b => b.is_confirmed).length} fiches
            </span>
          </div>
          <div className="p-2.5 bg-stone-100 text-stone-700 rounded-lg">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('QUEUE')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'QUEUE'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>File d'Attente ({queueReceptions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'COMPLETED'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Historique des Triturations ({productionBatches.length})</span>
          </button>
        </div>

        <button
          onClick={onExportExcel}
          className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          <span>Exporter Production Excel</span>
        </button>
      </div>

      {/* Content for TAB 1: Queue awaiting milling */}
      {activeTab === 'QUEUE' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Lots d'olives pesés en attente de passage sous presse</h3>
              <p className="text-xs text-stone-500">L'opérateur clique sur "Saisir Huile Extraite" dès l'obtention du liquide pour calculer le rendement</p>
            </div>
            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-900 rounded">
              {queueReceptions.length} lot(s) prêt(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">N° Ticket Réception</th>
                  <th className="p-3.5">Producteur / Client</th>
                  <th className="p-3.5">Variété & Qualité</th>
                  <th className="p-3.5 text-right">Poids Net d'Olives</th>
                  <th className="p-3.5">Heure d'arrivée</th>
                  <th className="p-3.5 text-right">Action Opérateur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {queueReceptions.length > 0 ? (
                  queueReceptions.map((rec) => (
                    <tr key={rec.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-stone-900 block">
                          {rec.ticket_number}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {rec.boxes_count} caisses
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-stone-900 block">
                          {rec.party_name}
                        </span>
                        <span className="text-[11px] text-stone-500 font-mono">
                          {rec.party_code || 'CLI'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-medium text-stone-800 block">
                          {rec.olive_variety}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {rec.quality}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <span className="font-mono font-black text-amber-950 text-base">
                          {rec.net_weight_kg.toLocaleString()} KG
                        </span>
                      </td>

                      <td className="p-3.5 text-stone-500 font-mono text-[11px]">
                        {new Date(rec.date).toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => onStartMilling(rec)}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 ml-auto transition-colors shadow-2xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Saisir Huile Extraite</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-stone-400 italic">
                      La file d'attente de trituration est vide. Enregistrez de nouvelles réceptions d'olives pour alimenter la presse.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content for TAB 2: Completed Batches */}
      {activeTab === 'COMPLETED' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Bon Trituration</th>
                  <th className="p-3.5">Producteur</th>
                  <th className="p-3.5">Ligne Broyeur</th>
                  <th className="p-3.5 text-right">Olives Net</th>
                  <th className="p-3.5 text-right">Huile Extraite</th>
                  <th className="p-3.5 text-right">Rendement (%)</th>
                  <th className="p-3.5 text-right">Rendement (L/100kg)</th>
                  <th className="p-3.5">Frais Trituration</th>
                  <th className="p-3.5">Statut / Verrou</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {productionBatches.length > 0 ? (
                  productionBatches.map((b) => (
                    <tr key={b.id} className="hover:bg-stone-50 transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-stone-900 block">
                          {b.ticket_number}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(b.started_at).toLocaleDateString('fr-TN')}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-stone-900 block">
                          {b.party_name}
                        </span>
                        <span className="text-[10px] text-stone-500">
                          Réf: {b.reception_ticket}
                        </span>
                      </td>

                      <td className="p-3.5 text-stone-700 font-medium">
                        {b.press_line}
                      </td>

                      <td className="p-3.5 text-right font-mono text-stone-800">
                        {b.olives_net_kg} KG
                      </td>

                      <td className="p-3.5 text-right">
                        <span className="font-mono font-black text-amber-950 text-sm block">
                          {b.oil_quantity_litres} L
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          ({b.oil_quantity_kg} KG)
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-mono font-black text-emerald-700 text-sm">
                        {b.yield_percentage.toFixed(2)} %
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-stone-800">
                        {b.yield_litres_per_100kg.toFixed(2)} L
                      </td>

                      <td className="p-3.5">
                        <span className="font-mono font-bold text-stone-900 block">
                          {b.milling_fee_total_tnd.toFixed(3)} TND
                        </span>
                        <span className="text-[10px] text-stone-500">
                          {b.milling_fee_mode} ({b.milling_fee_paid ? 'Payé' : 'À régler'})
                        </span>
                      </td>

                      <td className="p-3.5">
                        {b.is_confirmed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                            <Lock className="w-3 h-3 text-stone-600" />
                            Verrouillé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            Brouillon
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => onPrintBatch(b)}
                          className="p-1.5 hover:bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200 rounded"
                          title="Imprimer le bon de trituration"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-stone-400 italic">
                      Aucune trituration confirmée pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
