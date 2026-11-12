import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingUp,
  Plus,
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Tag
} from 'lucide-react';
import { ProductionBatch, GrignonSale, PurchaseBatch, ExpenseItem } from '../../types/production';
import { Language } from '../../lib/i18n';

interface FinancesManagerProps {
  productionBatches: ProductionBatch[];
  grignonSales: GrignonSale[];
  purchases: PurchaseBatch[];
  expenses: ExpenseItem[];
  lang: Language;
  onAddExpense: (expense: ExpenseItem) => void;
  onExportExcel: () => void;
}

export const FinancesManager: React.FC<FinancesManagerProps> = ({
  productionBatches,
  grignonSales,
  purchases,
  expenses,
  lang,
  onAddExpense,
  onExportExcel
}) => {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expCategory, setExpCategory] = useState<ExpenseItem['category']>('ENERGIE_ELECTRICITE');
  const [expLabel, setExpLabel] = useState('');
  const [expAmount, setExpAmount] = useState<number | ''>('');
  const [expBeneficiary, setExpBeneficiary] = useState('');
  const [expPaymentMode, setExpPaymentMode] = useState<ExpenseItem['payment_mode']>('ESPECES');

  // Calculations
  // 1. Milling fees revenue
  const millingFeesCash = productionBatches
    .filter(b => b.milling_fee_paid && b.milling_fee_mode === 'ESPECES')
    .reduce((acc, b) => acc + b.milling_fee_total_tnd, 0);

  const millingFeesUnpaid = productionBatches
    .filter(b => !b.milling_fee_paid)
    .reduce((acc, b) => acc + b.milling_fee_total_tnd, 0);

  // 2. Grignon sales revenue
  const grignonRevenue = grignonSales
    .filter(s => s.payment_status === 'PAYE')
    .reduce((acc, s) => acc + s.total_price_tnd, 0);

  const grignonUnpaid = grignonSales
    .filter(s => s.payment_status === 'IMPAYE')
    .reduce((acc, s) => acc + s.total_price_tnd, 0);

  // 3. Outflows
  const purchasesOutflow = purchases
    .filter(p => p.payment_status === 'PAYE')
    .reduce((acc, p) => acc + p.total_price_tnd, 0);

  const expensesOutflow = expenses.reduce((acc, e) => acc + e.amount_tnd, 0);

  // Totals
  const totalRevenue = millingFeesCash + grignonRevenue;
  const totalOutflows = purchasesOutflow + expensesOutflow;
  const netCashflow = totalRevenue - totalOutflows;

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expLabel.trim()) {
      alert('Veuillez saisir le libellé de la dépense.');
      return;
    }
    if (typeof expAmount !== 'number' || expAmount <= 0) {
      alert('Veuillez saisir un montant valide (> 0).');
      return;
    }

    const newExp: ExpenseItem = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString(),
      category: expCategory,
      label: expLabel.trim(),
      amount_tnd: expAmount,
      beneficiary: expBeneficiary.trim() || undefined,
      payment_mode: expPaymentMode,
      operator: 'Gérant Huilerie',
      created_at: new Date().toISOString()
    };

    onAddExpense(newExp);
    setIsExpenseModalOpen(false);
    setExpLabel('');
    setExpAmount('');
    setExpBeneficiary('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenues */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {lang === 'ar' ? 'إجمالي المقابيض (عصر + فريتوز)' : 'Recettes d’Exploitation'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 font-mono">
            {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}{' '}
            <span className="text-xs font-normal text-stone-500">TND</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-2">
            <span>Mouture: {millingFeesCash.toFixed(3)}</span> &bull; 
            <span>Grignons: {grignonRevenue.toFixed(3)}</span>
          </div>
        </div>

        {/* Total Outflows */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {lang === 'ar' ? 'المصاريف والمشتريات' : 'Dépenses & Achats'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 font-mono">
            {totalOutflows.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}{' '}
            <span className="text-xs font-normal text-stone-500">TND</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-2">
            <span>Achats: {purchasesOutflow.toFixed(3)}</span> &bull; 
            <span>Charges: {expensesOutflow.toFixed(3)}</span>
          </div>
        </div>

        {/* Net Cash Position */}
        <div className={`p-5 rounded-2xl border shadow-xs relative overflow-hidden ${
          netCashflow >= 0
            ? 'bg-gradient-to-br from-emerald-950 to-stone-900 text-white border-emerald-800'
            : 'bg-gradient-to-br from-rose-950 to-stone-900 text-white border-rose-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-300">
              {lang === 'ar' ? 'السيولة الصافية بالصندوق' : 'Solde Net de Caisse'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono">
            {netCashflow.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}{' '}
            <span className="text-xs font-normal text-stone-300">TND</span>
          </div>
          <div className="text-[11px] text-stone-300 mt-1">
            {netCashflow >= 0 ? '✓ Excédent net de campagne' : '⚠ Trésorerie déficitaire'}
          </div>
        </div>

        {/* Pending Receivables */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {lang === 'ar' ? 'مستحقات معلقة بالذمة' : 'Créances Clients à Recouvrer'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {(millingFeesUnpaid + grignonUnpaid).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}{' '}
            <span className="text-xs font-normal text-stone-500">TND</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Moutures impayées: {millingFeesUnpaid.toFixed(3)} TND
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-sm text-stone-900">
            {lang === 'ar' ? 'سجل مصاريف التشغيل والصيانة' : 'Journal des Charges d’Exploitation de l’Huilerie'}
          </h3>
          <p className="text-xs text-stone-500">
            {lang === 'ar' ? 'تسجيل فواتير الكهرباء، اليد العاملة والقطع' : 'Suivi des dépenses courantes (électricité STEG, main d’œuvre, pièces)'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportExcel}
            className="px-3 py-2 border border-stone-300 hover:bg-stone-50 rounded-lg text-xs font-bold text-stone-700 flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Exporter Synthèse</span>
          </button>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Enregistrer une Charge</span>
          </button>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-800 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Libellé de la Dépense</th>
                <th className="px-4 py-3">Bénéficiaire</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3 text-right">Montant (TND)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                    Aucune dépense d'exploitation enregistrée pour l'instant.
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
                      {new Date(e.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-bold text-[10px]">
                        <Tag className="w-3 h-3 text-stone-500" />
                        {e.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-stone-900">
                      {e.label}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {e.beneficiary || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] bg-stone-100 px-1.5 py-0.5 rounded">
                        {e.payment_mode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-black text-rose-600 text-sm">
                      -{e.amount_tnd.toFixed(3)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Expense */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-stone-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm">
                {lang === 'ar' ? 'إضافة نفقة تشغيل جديدة' : 'Nouvelle Dépense d’Exploitation'}
              </h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Catégorie *</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ENERGIE_ELECTRICITE">Énergie & Électricité (STEG)</option>
                  <option value="MAIN_DOEUVRE">Main d’œuvre saisonnière</option>
                  <option value="MAINTENANCE_PIECES">Maintenance & Pièces machines</option>
                  <option value="EAU_ASSAINISSEMENT">Eau & Lavage des olives</option>
                  <option value="TRANSPORT">Carburant & Transport</option>
                  <option value="DIVERS">Frais généraux divers</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Libellé de la Dépense *</label>
                <input
                  type="text"
                  required
                  value={expLabel}
                  onChange={(e) => setExpLabel(e.target.value)}
                  placeholder="Ex: Facture STEG Tranche Décembre"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Montant (TND) *</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="Ex: 850.000"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-bold text-rose-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Mode de Paiement</label>
                  <select
                    value={expPaymentMode}
                    onChange={(e) => setExpPaymentMode(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="ESPECES">Espèces</option>
                    <option value="CHEQUE">Chèque</option>
                    <option value="VIREMENT">Virement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Bénéficiaire / Fournisseur</label>
                <input
                  type="text"
                  value={expBeneficiary}
                  onChange={(e) => setExpBeneficiary(e.target.value)}
                  placeholder="Ex: STEG Agence Kairouan"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  Enregistrer la Dépense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
