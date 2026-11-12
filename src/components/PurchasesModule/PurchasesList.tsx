import React, { useState } from 'react';
import { ShoppingCart, Plus, FileSpreadsheet, Printer, Search, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { PurchaseBatch } from '../../types/production';
import { Language } from '../../lib/i18n';

interface PurchasesListProps {
  purchases: PurchaseBatch[];
  lang: Language;
  onNewPurchase: () => void;
  onPrintPurchase: (purchase: PurchaseBatch) => void;
  onExportExcel: () => void;
}

export const PurchasesList: React.FC<PurchasesListProps> = ({
  purchases,
  lang,
  onNewPurchase,
  onPrintPurchase,
  onExportExcel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredPurchases = purchases.filter(p => {
    const matchesSearch =
      p.doc_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || p.item_type === filterType;
    return matchesSearch && matchesType;
  });

  const totalOlivesKg = purchases
    .filter(p => p.item_type === 'OLIVES')
    .reduce((acc, p) => acc + p.quantity, 0);

  const totalOilLitres = purchases
    .filter(p => p.item_type === 'HUILE_VRAC')
    .reduce((acc, p) => acc + p.quantity, 0);

  const totalAmountTnd = purchases.reduce((acc, p) => acc + p.total_price_tnd, 0);
  const totalUnpaidTnd = purchases
    .filter(p => p.payment_status === 'IMPAYE')
    .reduce((acc, p) => acc + p.total_price_tnd, 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            {lang === 'ar' ? 'إجمالي شراء الزيتون' : 'Olives Achetées'}
          </span>
          <span className="text-xl sm:text-2xl font-black text-stone-900 font-mono mt-1 block">
            {totalOlivesKg.toLocaleString()} <span className="text-xs font-normal text-stone-500">KG</span>
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            {lang === 'ar' ? 'إجمالي شراء الزيت الصافي' : 'Huile Achetée en Vrac'}
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-600 font-mono mt-1 block">
            {totalOilLitres.toLocaleString()} <span className="text-xs font-normal text-stone-500">L</span>
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            {lang === 'ar' ? 'إجمالي المبالغ المصروفة' : 'Dépenses Totales d’Achat'}
          </span>
          <span className="text-xl sm:text-2xl font-black text-rose-600 font-mono mt-1 block">
            {totalAmountTnd.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}{' '}
            <span className="text-xs font-normal text-stone-500">TND</span>
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            {lang === 'ar' ? 'المستحقات غير الخالصة' : 'En Attente de Règlement'}
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-500 font-mono mt-1 block">
            {totalUnpaidTnd.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}{' '}
            <span className="text-xs font-normal text-stone-500">TND</span>
          </span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par n° de bon ou fournisseur..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">Tous les produits</option>
            <option value="OLIVES">Olives seules</option>
            <option value="HUILE_VRAC">Huile seule</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportExcel}
            className="px-3 py-2 border border-stone-300 hover:bg-stone-50 rounded-lg text-xs font-bold text-stone-700 flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Exporter Excel</span>
          </button>

          <button
            onClick={onNewPurchase}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel Achat (BON-ACH)</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-800 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">N° Bon</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Fournisseur</th>
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3 text-right">Quantité</th>
                <th className="px-4 py-3 text-right">Prix Unitaire</th>
                <th className="px-4 py-3 text-right">Total (TND)</th>
                <th className="px-4 py-3 text-center">Règlement</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-stone-400">
                    Aucun bon d'achat enregistré pour le moment.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-stone-900">
                      {p.doc_number}
                    </td>
                    <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
                      {new Date(p.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 font-bold text-stone-800">
                      {p.supplier_name}
                      {p.supplier_phone && (
                        <span className="block text-[10px] text-stone-400 font-normal">
                          {p.supplier_phone}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.item_type === 'OLIVES'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.item_type === 'OLIVES' ? `Olives (${p.variety || 'Standard'})` : 'Huile Vrac'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-stone-900">
                      {p.quantity.toLocaleString()}{' '}
                      <span className="text-[10px] text-stone-400 font-normal">
                        {p.item_type === 'OLIVES' ? 'KG' : 'L'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-stone-600">
                      {p.unit_price_tnd.toFixed(3)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-rose-600">
                      {p.total_price_tnd.toFixed(3)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.payment_status === 'PAYE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {p.payment_status === 'PAYE' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-600" />
                        )}
                        <span>{p.payment_status === 'PAYE' ? 'Payé' : 'Impayé'}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onPrintPurchase(p)}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded text-stone-700 font-bold flex items-center gap-1 ml-auto text-[11px] transition"
                        title="Imprimer le bon d'achat"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Bon</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
