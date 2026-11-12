import React, { useState, useEffect } from 'react';
import { 
  ArrowDownLeft, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Calendar, 
  User, 
  FileText,
  ShieldAlert
} from 'lucide-react';
import { CuveDetails, Client, UserSession, AppSettings, Movement } from '../types';
import confetti from 'canvas-confetti';

interface MovementEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cuvesDetails: CuveDetails[];
  clients: Client[];
  initialCuveId?: string;
  initialClientId?: string;
  currentUser: UserSession;
  onSubmit: (params: {
    clientId: string;
    cuveId: string;
    quantite: number;
    utilisateur: string;
    dateMouvement?: string;
    observations?: string;
  }) => Promise<Movement> | Movement;
  onOpenReceipt: (movement: Movement) => void;
  settings: AppSettings;
}

export const MovementEntryModal: React.FC<MovementEntryModalProps> = ({
  isOpen,
  onClose,
  cuvesDetails,
  clients,
  initialCuveId,
  initialClientId,
  currentUser,
  onSubmit,
  onOpenReceipt,
  settings
}) => {
  const activeCuves = cuvesDetails.filter(c => c.active);
  
  const [selectedClientId, setSelectedClientId] = useState<string>(initialClientId || (clients[0]?.id || ''));
  const [selectedCuveId, setSelectedCuveId] = useState<string>(initialCuveId || (activeCuves[0]?.id || ''));
  const [quantite, setQuantite] = useState<string>('1000');
  const [observations, setObservations] = useState<string>('Huile d’olive vierge extra - Première pression à froid');
  const [dateMouvement, setDateMouvement] = useState<string>(new Date().toISOString().slice(0, 16));
  const [isCustomDate, setIsCustomDate] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (initialCuveId) setSelectedCuveId(initialCuveId);
    if (initialClientId) setSelectedClientId(initialClientId);
  }, [initialCuveId, initialClientId]);

  if (!isOpen) return null;

  const currentCuve = activeCuves.find(c => c.id === selectedCuveId);
  const currentClient = clients.find(c => c.id === selectedClientId);

  const numQty = parseFloat(quantite) || 0;
  const capaciteRestante = currentCuve ? currentCuve.capaciteRestante : 0;
  const isOverCapacity = currentCuve ? numQty > capaciteRestante : false;
  const isCuvePleine = capaciteRestante <= 0.001;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Protection double clic
    setErrorMessage('');

    if (numQty <= 0) {
      setErrorMessage("La quantité doit être strictement supérieure à 0 Litre.");
      return;
    }

    if (isOverCapacity) {
      setErrorMessage(
        `Capacité insuffisante : La cuve '${currentCuve?.nom}' ne peut accueillir que ${capaciteRestante.toLocaleString('fr-FR')} L. Entrée de ${numQty.toLocaleString('fr-FR')} L refusée !`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const createdMovement = await onSubmit({
        clientId: selectedClientId,
        cuveId: selectedCuveId,
        quantite: numQty,
        utilisateur: currentUser.nomAffiche,
        dateMouvement: isCustomDate ? new Date(dateMouvement).toISOString() : new Date().toISOString(),
        observations
      });

      // Confetti feedback
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {
        // ignore
      }

      onClose();
      onOpenReceipt(createdMovement);
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900">
                Nouvelle Entrée d'Huile (Réception)
              </h3>
              <p className="text-xs text-stone-500">
                Génération automatique du bon officiel et contrôle des capacités
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message d'erreur */}
        {errorMessage && (
          <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-xs text-red-700 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Sélection du Client */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Client / Déposant (Propriétaire de l'huile) *
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.codeClient} - {c.nomComplet} {c.telephone ? `(${c.telephone})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Sélection de la Cuve / Pile */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-stone-700">
                Pile / Cuve Réceptrice *
              </label>
              {currentCuve && (
                <span className={`text-[11px] font-bold ${
                  isCuvePleine ? 'text-red-600' : 'text-emerald-700'
                }`}>
                  Place libre : {capaciteRestante.toLocaleString('fr-FR')} L / {currentCuve.capaciteMax.toLocaleString('fr-FR')} L
                </span>
              )}
            </div>

            <select
              value={selectedCuveId}
              onChange={(e) => setSelectedCuveId(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              {activeCuves.map(cu => {
                const libre = cu.capaciteRestante;
                return (
                  <option key={cu.id} value={cu.id} disabled={libre <= 0}>
                    {cu.numero} - {cu.nom} ({libre.toLocaleString('fr-FR')} L disponible {libre <= 0 ? '- CUVE PLEINE' : ''})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Quantité en Litres */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-stone-700">
                Quantité d'Huile Réceptionnée (Litres) *
              </label>
              {isOverCapacity && (
                <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Dépassement de {(numQty - capaciteRestante).toFixed(1)} L !
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.1"
                required
                value={quantite}
                onChange={(e) => setQuantite(e.target.value)}
                className={`w-full px-3 py-3 sm:py-2.5 border rounded-xl text-xl sm:text-lg font-mono font-bold focus:ring-2 focus:outline-none ${
                  isOverCapacity 
                    ? 'border-red-500 bg-red-50 text-red-900 focus:ring-red-400' 
                    : 'border-stone-300 focus:ring-emerald-600 text-stone-900'
                }`}
                placeholder="0.0"
              />
              <span className="absolute right-3 top-3.5 sm:top-3 text-xs font-bold text-stone-400">
                Litres ({settings.unite})
              </span>
            </div>

            {/* Quick volume chips for mobile touch convenience */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[100, 250, 500, 1000, 2000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setQuantite(String(val))}
                  className="px-2.5 py-1 text-xs font-mono font-semibold rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 border border-stone-200 transition cursor-pointer active:scale-95"
                >
                  +{val} L
                </button>
              ))}
              {currentCuve && capaciteRestante > 0 && (
                <button
                  type="button"
                  onClick={() => setQuantite(String(Math.floor(capaciteRestante * 10) / 10))}
                  className="px-2.5 py-1 text-xs font-mono font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 transition cursor-pointer active:scale-95"
                >
                  Max ({Math.floor(capaciteRestante)} L)
                </button>
              )}
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Observations / Qualité / Type d'olive
            </label>
            <input
              type="text"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="ex: Première pression à froid, acidité 0.3%, olives Chemlali"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          {/* Option Date Manuelle (Admin Uniquement avec Audit) */}
          <div className="pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-600 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                Date et heure du mouvement
              </span>
              {currentUser.role === 'admin' ? (
                <button
                  type="button"
                  onClick={() => setIsCustomDate(!isCustomDate)}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  {isCustomDate ? "Utiliser l'heure actuelle" : "Modifier manuellement (Audité)"}
                </button>
              ) : (
                <span className="text-[11px] text-stone-400 font-mono">
                  Enregistrement automatique
                </span>
              )}
            </div>

            {isCustomDate && currentUser.role === 'admin' && (
              <div className="mt-2 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                <input
                  type="datetime-local"
                  value={dateMouvement}
                  onChange={(e) => setDateMouvement(e.target.value)}
                  className="w-full px-2 py-1.5 border border-stone-300 rounded text-xs bg-white focus:outline-none"
                />
                <p className="text-[10px] text-amber-800 mt-1">
                  ⚠️ La modification de la date sera enregistrée dans le journal d'audit de sécurité.
                </p>
              </div>
            )}
          </div>

          {/* Opérateur responsable */}
          <div className="bg-stone-50 px-3 py-2 rounded-lg text-xs text-stone-600 flex items-center justify-between border border-stone-200">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-stone-400" />
              Opérateur responsable :
            </span>
            <span className="font-bold text-stone-900">{currentUser.nomAffiche}</span>
          </div>

          {/* Boutons d'action */}
          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isOverCapacity || numQty <= 0}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold text-white shadow-md transition flex items-center gap-1.5 ${
                isSubmitting || isOverCapacity || numQty <= 0
                  ? 'bg-stone-400 cursor-not-allowed opacity-70'
                  : 'bg-emerald-700 hover:bg-emerald-600 active:scale-95 cursor-pointer'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Enregistrement..." : "Valider l'Entrée & Générer Bon A4"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
