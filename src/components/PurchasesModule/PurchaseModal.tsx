import React, { useState } from 'react';
import { X, ShoppingCart, Calculator, Check, AlertCircle } from 'lucide-react';
import { PurchaseBatch } from '../../types/production';
import { TankStockDetail } from '../../types/stock';
import { Language } from '../../lib/i18n';

interface PurchaseModalProps {
  tanks: TankStockDetail[];
  currentOperator: string;
  lang: Language;
  onClose: () => void;
  onSubmit: (purchase: PurchaseBatch) => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  tanks,
  currentOperator,
  lang,
  onClose,
  onSubmit
}) => {
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [itemType, setItemType] = useState<'OLIVES' | 'HUILE_VRAC'>('OLIVES');
  const [variety, setVariety] = useState('Chemlali');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<'ESPECES' | 'CHEQUE' | 'VIREMENT' | 'A_TERME'>('ESPECES');
  const [paymentStatus, setPaymentStatus] = useState<'PAYE' | 'IMPAYE'>('PAYE');
  const [destinationTankId, setDestinationTankId] = useState('');
  const [notes, setNotes] = useState('');

  const numQty = typeof quantity === 'number' ? quantity : 0;
  const numPrice = typeof unitPrice === 'number' ? unitPrice : 0;
  const totalPriceTnd = Math.round(numQty * numPrice * 1000) / 1000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      alert('Veuillez saisir le nom du fournisseur / fellaḥ.');
      return;
    }
    if (numQty <= 0) {
      alert('Veuillez saisir une quantité valide (> 0).');
      return;
    }
    if (numPrice <= 0) {
      alert('Veuillez saisir un prix unitaire valide (> 0).');
      return;
    }

    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const newPurchase: PurchaseBatch = {
      id: `ach-${Date.now()}`,
      doc_number: `BON-ACH-${year}-${rand}`,
      date: new Date().toISOString(),
      supplier_name: supplierName.trim(),
      supplier_phone: supplierPhone.trim() || null,
      item_type: itemType,
      variety: itemType === 'OLIVES' ? variety : undefined,
      quantity: numQty,
      unit_price_tnd: numPrice,
      total_price_tnd: totalPriceTnd,
      payment_mode: paymentMode,
      payment_status: paymentStatus,
      operator: currentOperator,
      destination_tank_id: itemType === 'HUILE_VRAC' && destinationTankId ? destinationTankId : undefined,
      notes: notes.trim() || null,
      created_at: new Date().toISOString()
    };

    onSubmit(newPurchase);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                {lang === 'ar' ? 'تسجيل شراء جديد (زيتون / زيت)' : 'Nouvel Achat Huilerie (BON-ACH)'}
              </h3>
              <p className="text-xs text-amber-300 font-medium">
                {lang === 'ar' ? 'شراء لحساب المعصرة من الفلاحة والمزودين' : 'Achat direct pour compte propre de l’huilerie'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Supplier Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {lang === 'ar' ? 'اسم المزود / الفلاح *' : 'Fournisseur / Agriculteur *'}
              </label>
              <input
                type="text"
                required
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Ex: Hedi Jemai"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {lang === 'ar' ? 'الهاتف' : 'Téléphone'}
              </label>
              <input
                type="tel"
                value={supplierPhone}
                onChange={(e) => setSupplierPhone(e.target.value)}
                placeholder="+216 ..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Type of Item & Variety */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {lang === 'ar' ? 'نوع المشتريات *' : 'Type de Produit Acheté *'}
              </label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="OLIVES">Olives en Vrac (KG)</option>
                <option value="HUILE_VRAC">Huile d’Olive en Vrac (Litres)</option>
              </select>
            </div>

            {itemType === 'OLIVES' ? (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'ar' ? 'الصنف' : 'Variété Olives'}
                </label>
                <select
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Chemlali">Chemlali (شملالي)</option>
                  <option value="Chétoui">Chétoui (شتوي)</option>
                  <option value="Sahli">Sahli (ساحلي)</option>
                  <option value="Zarrazi">Zarrazi (زرازي)</option>
                  <option value="Mélange">Mélange (خليط)</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'ar' ? 'حوض التخزين (اختياري)' : 'Cuve de dépôt (optionnel)'}
                </label>
                <select
                  value={destinationTankId}
                  onChange={(e) => setDestinationTankId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Sélectionner une cuve disponible...</option>
                  {tanks.filter(t => t.tank.is_active).map(t => (
                    <option key={t.tank.id} value={t.tank.id}>
                      {t.tank.name} ({t.tank.code}) - Libre: {t.remaining_capacity} L
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quantity & Unit Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                {lang === 'ar' ? `الكمية (${itemType === 'OLIVES' ? 'كلغ' : 'لتر'}) *` : `Quantité (${itemType === 'OLIVES' ? 'KG' : 'Litres'}) *`}
              </label>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder={itemType === 'OLIVES' ? 'Ex: 1500' : 'Ex: 300'}
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                {lang === 'ar' ? 'سعر الوحدة (دينار) *' : 'Prix Unitaire (TND) *'}
              </label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder={itemType === 'OLIVES' ? 'Ex: 2.200' : 'Ex: 14.500'}
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Total Display */}
            <div className="sm:col-span-2 pt-2 border-t border-amber-200/80 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">
                {lang === 'ar' ? 'المبلغ الإجمالي المستحق :' : 'Montant Total d’Achat :'}
              </span>
              <span className="text-base font-black text-amber-950 font-mono">
                {totalPriceTnd.toFixed(3)} TND
              </span>
            </div>
          </div>

          {/* Payment & Settlement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {lang === 'ar' ? 'طريقة الدفع' : 'Mode de Paiement'}
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ESPECES">Espèces (نقدا)</option>
                <option value="CHEQUE">Chèque (شيك)</option>
                <option value="VIREMENT">Virement bancaire</option>
                <option value="A_TERME">À terme / Crédit (مؤجل)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {lang === 'ar' ? 'حالة الخلاص' : 'Statut du Règlement'}
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="PAYE">Payé immédiatement (خالص)</option>
                <option value="IMPAYE">Impayé / En attente (غير خالص)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {lang === 'ar' ? 'ملاحظات' : 'Observations & Références'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Achat récolte parcelle Sidi Bouzid"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Operator Signature Tag */}
          <div className="text-[11px] text-stone-500 flex items-center justify-between pt-2 border-t border-stone-200">
            <span>Opérateur responsable : <strong className="text-stone-700">{currentOperator}</strong></span>
            <span>Émission instantanée du bon officiel</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Valider l'Achat & Imprimer le Bon</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
