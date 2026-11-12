/**
 * Huilerie Jemai (معصرة جماعي) - ERP & Gestion de Stock
 * Complete Oléicole ERP Application
 */
import React, { useState, useEffect } from 'react';
import {
  fetchLiveTanks,
  fetchLiveParties,
  fetchLiveOperations,
  fetchLiveTankMovements,
  fetchLiveAppSettings,
  saveLiveOperation,
  DEFAULT_APP_SETTINGS,
  DEFAULT_PROFILES
} from './lib/supabase';
import { calculateTankStocks, calculateClientStocks } from './lib/stockCalculation';
import {
  exportTanksToExcel,
  exportClientsToExcel,
  exportOliveReceptionsToExcel,
  exportProductionToExcel,
  exportGrignonsToExcel,
  exportPurchasesToExcel,
  exportFinancesToExcel
} from './lib/export';
import { Tank, Party, Operation, TankMovement, UserProfile, AppSettings, TankStockDetail } from './types/stock';
import { OliveReception, ProductionBatch, GrignonSale, PurchaseBatch, ExpenseItem, AuditLog } from './types/production';
import { Language, translations } from './lib/i18n';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveModule } from './components/Sidebar';
import { CuvesGrid } from './components/CuvesModule/CuvesGrid';
import { OperationModal } from './components/CuvesModule/OperationModal';
import { TankDetailModal } from './components/CuvesModule/TankDetailModal';
import { OliveReceptionsList } from './components/OlivesModule/OliveReceptionsList';
import { OliveReceptionModal } from './components/OlivesModule/OliveReceptionModal';
import { ProductionQueue } from './components/ProductionModule/ProductionQueue';
import { ProductionEntryModal } from './components/ProductionModule/ProductionEntryModal';
import { CustomerProductionLedger } from './components/CustomerHistoryModule/CustomerProductionLedger';
import { GrignonsSalesList } from './components/GrignonsModule/GrignonsSalesList';
import { GrignonSaleModal } from './components/GrignonsModule/GrignonSaleModal';
import { PurchasesList } from './components/PurchasesModule/PurchasesList';
import { PurchaseModal } from './components/PurchasesModule/PurchaseModal';
import { FinancesManager } from './components/FinancesModule/FinancesManager';
import { AutomatedTestSuite } from './components/AutomatedTestSuite';
import { OperationsList } from './components/OperationsModule/OperationsList';
import { ClientsList } from './components/ClientsModule/ClientsList';
import { SettingsView } from './components/SettingsModule/SettingsView';
import { PrintDocument, PrintableDocType } from './components/Documents/PrintDocument';

export default function App() {
  const [lang, setLang] = useState<Language>('fr');
  const [activeModule, setActiveModule] = useState<ActiveModule>('CUVES');

  // Core Data
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [movements, setMovements] = useState<TankMovement[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [profiles, setProfiles] = useState<UserProfile[]>(DEFAULT_PROFILES);
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(DEFAULT_PROFILES[0]);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // ERP Extended Modules State
  const [receptions, setReceptions] = useState<OliveReception[]>(() => {
    const saved = localStorage.getItem('huilerie_receptions');
    if (saved) return JSON.parse(saved);
    // Seed initial demo olive receptions
    return [
      {
        id: 'olv-101',
        ticket_number: 'BON-OLV-2026-0001',
        date: new Date(Date.now() - 3600000 * 5).toISOString(),
        party_id: 'cli-1794168997971',
        party_name: 'Mohamed jemai',
        party_code: 'CLI-002',
        olive_variety: 'Chemlali',
        boxes_count: 32,
        gross_weight_kg: 1850,
        tare_weight_kg: 350,
        net_weight_kg: 1500,
        quality: 'Superieure',
        status: 'EN_FILE',
        operator: 'achref',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'olv-102',
        ticket_number: 'BON-OLV-2026-0002',
        date: new Date(Date.now() - 3600000 * 2).toISOString(),
        party_id: 'cli-1794030003453',
        party_name: 'MOKHTAR JEMAI',
        party_code: 'CLI-007',
        olive_variety: 'Chétoui',
        boxes_count: 45,
        gross_weight_kg: 2600,
        tare_weight_kg: 400,
        net_weight_kg: 2200,
        quality: 'Standard',
        status: 'EN_FILE',
        operator: 'achref',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ];
  });

  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>(() => {
    const saved = localStorage.getItem('huilerie_production_batches');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'prd-201',
        ticket_number: 'BON-PRD-2026-0001',
        reception_id: 'olv-legacy',
        reception_ticket: 'BON-OLV-2026-0000',
        party_id: 'cli-1794168997971',
        party_name: 'Mohamed jemai',
        party_code: 'CLI-002',
        olives_net_kg: 2000,
        press_line: 'Ligne Inox 1 (Alfa Laval)',
        oil_input_unit: 'L',
        oil_quantity_entered: 420,
        oil_density: 0.918,
        oil_quantity_kg: 385.5,
        oil_quantity_litres: 420,
        yield_percentage: 19.28,
        yield_litres_per_100kg: 21.0,
        grignons_estimated_kg: 900,
        milling_fee_rate: 0.080,
        milling_fee_mode: 'ESPECES',
        milling_fee_total_tnd: 160.000,
        milling_fee_paid: true,
        operator: 'Mohamed Jemai (Gérant)',
        status: 'CONFIRME',
        started_at: new Date(Date.now() - 86400000).toISOString(),
        completed_at: new Date(Date.now() - 86400000).toISOString(),
        is_confirmed: true,
        oil_destination: 'SORTIE_CLIENT',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  });

  const [grignonSales, setGrignonSales] = useState<GrignonSale[]>(() => {
    const saved = localStorage.getItem('huilerie_grignon_sales');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'gri-301',
        doc_number: 'BON-GRI-2026-0001',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        buyer_name: 'Usine d’Extraction du Sahel',
        truck_plate: '112 TU 9980',
        driver_name: 'Naceur Bouazizi',
        gross_weight_kg: 26000,
        tare_weight_kg: 10500,
        net_weight_kg: 15500,
        net_weight_tonnes: 15.5,
        unit_price_per_tonne_tnd: 185.000,
        total_price_tnd: 2867.500,
        payment_mode: 'ESPECES',
        payment_status: 'PAYE',
        operator: 'Mohamed Jemai (Gérant)',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ];
  });

  const [purchases, setPurchases] = useState<PurchaseBatch[]>(() => {
    const saved = localStorage.getItem('huilerie_purchases');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'ach-401',
        doc_number: 'BON-ACH-2026-0001',
        date: new Date(Date.now() - 86400000 * 3).toISOString(),
        supplier_name: 'Hedi Jemai',
        supplier_phone: '+216 98 123 456',
        item_type: 'OLIVES',
        variety: 'Chemlali',
        quantity: 3200,
        unit_price_tnd: 2.150,
        total_price_tnd: 6880.000,
        payment_mode: 'ESPECES',
        payment_status: 'PAYE',
        operator: 'Mohamed Jemai (Gérant)',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ];
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('huilerie_expenses');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'exp-501',
        date: new Date(Date.now() - 86400000 * 4).toISOString(),
        category: 'ENERGIE_ELECTRICITE',
        label: 'Facture STEG Moyenne Tension Décembre',
        amount_tnd: 1250.000,
        beneficiary: 'STEG Kairouan',
        payment_mode: 'CHEQUE',
        operator: 'Mohamed Jemai (Gérant)',
        created_at: new Date(Date.now() - 86400000 * 4).toISOString()
      },
      {
        id: 'exp-502',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        category: 'MAINTENANCE_PIECES',
        label: 'Vidange et filtres décanteur centrifuge',
        amount_tnd: 380.000,
        beneficiary: 'Alfa Laval SAV',
        payment_mode: 'ESPECES',
        operator: 'Mohamed Jemai (Gérant)',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('huilerie_audit_logs');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Modal Controls
  const [activeModal, setActiveModal] = useState<
    | null
    | { type: 'STOCK_OPERATION'; opType: 'ENTREE' | 'SORTIE' | 'TRANSFERT'; preselectedTankId?: string }
    | { type: 'TANK_DETAIL'; tankDetail: TankStockDetail }
    | { type: 'OLIVE_RECEPTION' }
    | { type: 'PRODUCTION_ENTRY'; reception: OliveReception }
    | { type: 'GRIGNON_SALE' }
    | { type: 'PURCHASE' }
    | { type: 'PRINT'; docType: PrintableDocType; data: any }
  >(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('huilerie_receptions', JSON.stringify(receptions));
  }, [receptions]);

  useEffect(() => {
    localStorage.setItem('huilerie_production_batches', JSON.stringify(productionBatches));
  }, [productionBatches]);

  useEffect(() => {
    localStorage.setItem('huilerie_grignon_sales', JSON.stringify(grignonSales));
  }, [grignonSales]);

  useEffect(() => {
    localStorage.setItem('huilerie_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('huilerie_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('huilerie_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Initial Data Load
  const loadInitialData = async () => {
    try {
      const [tanksData, partiesData, opsData, mvtsData, settingsData] = await Promise.all([
        fetchLiveTanks(),
        fetchLiveParties(),
        fetchLiveOperations(),
        fetchLiveTankMovements(),
        fetchLiveAppSettings()
      ]);

      if (tanksData.length > 0) setTanks(tanksData);
      if (partiesData.length > 0) setParties(partiesData);
      if (opsData.length > 0) setOperations(opsData);
      if (mvtsData.length > 0) setMovements(mvtsData);
      setAppSettings(settingsData);
      setIsOnline(true);
    } catch (err) {
      console.warn('Initial data load completed in offline mode', err);
      setIsOnline(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Update HTML document direction and lang attribute
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Stock calculations
  const {
    tankDetails,
    totalCapacity,
    totalStoredOil,
    totalAvailableCapacity,
    globalFillPercentage
  } = calculateTankStocks(tanks, parties, operations, movements, appSettings.threshold);

  const clientStockSummaries = calculateClientStocks(parties, tanks, operations, movements);

  // Audit Log Helper
  const logAudit = (action: string, moduleName: string, details: string, recordId?: string) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: currentProfile.display_name,
      action,
      module: moduleName,
      record_id: recordId,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Operation Handlers
  const handleSaveStockOperation = async (op: Operation, newMvts: TankMovement[]) => {
    setOperations(prev => [op, ...prev]);
    setMovements(prev => [...prev, ...newMvts]);
    setActiveModal(null);

    logAudit(
      `Création ${op.type}`,
      'Cuves & Stock',
      `Bon ${op.doc_number}: ${op.total_quantity} L pour client ${op.party_id}`,
      op.id
    );

    // Persist to Supabase
    await saveLiveOperation(op, newMvts);

    // Open print voucher preview
    const docType: PrintableDocType = op.type === 'ENTREE' ? 'STOCK_IN' : op.type === 'SORTIE' ? 'STOCK_OUT' : 'STOCK_TRANSFER';
    setActiveModal({
      type: 'PRINT',
      docType,
      data: {
        ...op,
        party_name: parties.find(p => p.id === op.party_id)?.name,
        movements: newMvts.map(m => ({
          ...m,
          tank_code: tanks.find(t => t.id === m.tank_id)?.code
        }))
      }
    });
  };

  const handleCancelOperation = (operationId: string) => {
    setOperations(prev => prev.map(o => o.id === operationId ? { ...o, status: 'ANNULE' } : o));
    logAudit('Annulation Bon Stock', 'Cuves & Stock', `Opération ${operationId} annulée`, operationId);
  };

  const handleSaveOliveReception = (reception: OliveReception, sendToQueue: boolean) => {
    // If client is new, register in parties
    if (!parties.some(p => p.id === reception.party_id)) {
      const newParty: Party = {
        id: reception.party_id,
        code: `CLI-${String(parties.length + 1).padStart(3, '0')}`,
        name: reception.party_name,
        is_deleted: false,
        created_at: new Date().toISOString()
      };
      setParties(prev => [...prev, newParty]);
    }

    setReceptions(prev => [reception, ...prev]);
    setActiveModal(null);

    logAudit(
      'Réception Olives',
      'Olives',
      `Ticket ${reception.ticket_number}: ${reception.net_weight_kg} KG (${reception.olive_variety}) de ${reception.party_name}`,
      reception.id
    );

    // Open print voucher preview
    setActiveModal({
      type: 'PRINT',
      docType: 'OLIVE_RECEPTION',
      data: reception
    });
  };

  const handleSendToQueue = (receptionId: string) => {
    setReceptions(prev => prev.map(r => r.id === receptionId ? { ...r, status: 'EN_FILE' } : r));
    logAudit('Envoi File Trituration', 'Olives', `Lot ${receptionId} placé en file d'attente`, receptionId);
  };

  const handleSaveProductionBatch = async (batch: ProductionBatch, optionalDepositTankId?: string) => {
    // 1. Mark reception as completed
    setReceptions(prev => prev.map(r => r.id === batch.reception_id ? { ...r, status: 'TERMINE' } : r));

    // 2. Save batch in production batches
    setProductionBatches(prev => [batch, ...prev]);

    logAudit(
      'Trituration & Rendement Confirmé',
      'Trituration',
      `Bon ${batch.ticket_number}: ${batch.oil_quantity_litres} L extraits (${batch.yield_percentage}% de rendement) pour ${batch.party_name}. Fiche verrouillée.`,
      batch.id
    );

    // 3. CRITICAL BUSINESS RULE 10:
    // If customer explicitly selected "Déposer en Cuve de Stockage", create a corresponding Stock In operation!
    if (optionalDepositTankId && batch.oil_destination === 'STOCKAGE_CUVE') {
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      const opId = `mouv-dep-${Date.now()}`;
      const stockOp: Operation = {
        id: opId,
        doc_number: `BON-REC-${year}-${rand}`,
        type: 'ENTREE',
        party_id: batch.party_id,
        operator: currentProfile.display_name,
        total_quantity: batch.oil_quantity_litres,
        notes: `Dépôt direct de l'huile produite suite trituration ${batch.ticket_number}`,
        status: 'VALIDE',
        operation_date: new Date().toISOString()
      };
      const stockMvt: TankMovement = {
        id: `tm-${opId}-${optionalDepositTankId}`,
        operation_id: opId,
        tank_id: optionalDepositTankId,
        party_id: batch.party_id,
        direction: 'IN',
        quantity: batch.oil_quantity_litres,
        notes: `Dépôt issu de ${batch.ticket_number}`,
        created_at: new Date().toISOString()
      };

      setOperations(prev => [stockOp, ...prev]);
      setMovements(prev => [...prev, stockMvt]);
      await saveLiveOperation(stockOp, [stockMvt]);

      logAudit(
        'Dépôt Cuve Issu Trituration',
        'Cuves & Stock',
        `Création Entrée Stock ${stockOp.doc_number}: ${batch.oil_quantity_litres} L dans cuve ${optionalDepositTankId}`,
        stockOp.id
      );
    }

    setActiveModal({
      type: 'PRINT',
      docType: 'PRODUCTION_TICKET',
      data: batch
    });
  };

  const handleDepositCustomerOilInTank = async (batch: ProductionBatch, targetTankId: string) => {
    // Explicit deposit from customer history
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const opId = `mouv-dep-${Date.now()}`;
    const stockOp: Operation = {
      id: opId,
      doc_number: `BON-REC-${year}-${rand}`,
      type: 'ENTREE',
      party_id: batch.party_id,
      operator: currentProfile.display_name,
      total_quantity: batch.oil_quantity_litres,
      notes: `Transfert en cuve depuis lot de trituration ${batch.ticket_number}`,
      status: 'VALIDE',
      operation_date: new Date().toISOString()
    };
    const stockMvt: TankMovement = {
      id: `tm-${opId}-${targetTankId}`,
      operation_id: opId,
      tank_id: targetTankId,
      party_id: batch.party_id,
      direction: 'IN',
      quantity: batch.oil_quantity_litres,
      notes: `Dépôt cuve issu de ${batch.ticket_number}`,
      created_at: new Date().toISOString()
    };

    setOperations(prev => [stockOp, ...prev]);
    setMovements(prev => [...prev, stockMvt]);

    // Update batch destination
    setProductionBatches(prev => prev.map(b => b.id === batch.id ? { ...b, oil_destination: 'STOCKAGE_CUVE', destination_tank_id: targetTankId } : b));

    await saveLiveOperation(stockOp, [stockMvt]);

    logAudit(
      'Mise en Cuve d’Huile Client',
      'Historique Client',
      `Huile du lot ${batch.ticket_number} (${batch.oil_quantity_litres} L) déposée dans la cuve ${targetTankId}`,
      stockOp.id
    );

    alert(`Succès : L'huile (${batch.oil_quantity_litres} L) a été déposée dans la cuve et enregistrée sous le bon ${stockOp.doc_number}.`);
  };

  const handleSaveGrignonSale = (sale: GrignonSale) => {
    setGrignonSales(prev => [sale, ...prev]);
    setActiveModal(null);

    logAudit(
      'Vente Grignons',
      'Vente Grignons',
      `Bon ${sale.doc_number}: ${sale.net_weight_tonnes} T vendues à ${sale.buyer_name} pour ${sale.total_price_tnd} TND`,
      sale.id
    );

    setActiveModal({
      type: 'PRINT',
      docType: 'GRIGNON_SALE',
      data: sale
    });
  };

  const handleSavePurchase = async (purchase: PurchaseBatch) => {
    setPurchases(prev => [purchase, ...prev]);
    setActiveModal(null);

    logAudit(
      'Achat Direct Huilerie',
      'Achats & Fournisseurs',
      `Bon ${purchase.doc_number}: ${purchase.quantity} ${purchase.item_type === 'OLIVES' ? 'KG' : 'L'} acheté(s) de ${purchase.supplier_name} pour ${purchase.total_price_tnd} TND`,
      purchase.id
    );

    // If purchase is oil and destination tank was chosen, register stock in
    if (purchase.item_type === 'HUILE_VRAC' && purchase.destination_tank_id) {
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      const opId = `mouv-ach-${Date.now()}`;
      const stockOp: Operation = {
        id: opId,
        doc_number: `BON-REC-${year}-${rand}`,
        type: 'ENTREE',
        party_id: 'cli-huilerie-propre',
        operator: currentProfile.display_name,
        total_quantity: purchase.quantity,
        notes: `Achat huile pour compte propre de l'huilerie (${purchase.doc_number})`,
        status: 'VALIDE',
        operation_date: new Date().toISOString()
      };
      const stockMvt: TankMovement = {
        id: `tm-${opId}-${purchase.destination_tank_id}`,
        operation_id: opId,
        tank_id: purchase.destination_tank_id,
        party_id: 'cli-huilerie-propre',
        direction: 'IN',
        quantity: purchase.quantity,
        notes: `Stock propre issu de ${purchase.doc_number}`,
        created_at: new Date().toISOString()
      };

      setOperations(prev => [stockOp, ...prev]);
      setMovements(prev => [...prev, stockMvt]);
      await saveLiveOperation(stockOp, [stockMvt]);
    }

    setActiveModal({
      type: 'PRINT',
      docType: 'PURCHASE_RECEIPT',
      data: purchase
    });
  };

  const handleAddExpense = (expense: ExpenseItem) => {
    setExpenses(prev => [expense, ...prev]);
    logAudit(
      'Dépense Exploitation',
      'Caisse & Finances',
      `Charge: ${expense.label} (${expense.amount_tnd} TND) - Catégorie ${expense.category}`,
      expense.id
    );
  };

  const handleAddNewClient = (client: { name: string; phone?: string; notes?: string }) => {
    const newParty: Party = {
      id: `cli-${Date.now()}`,
      code: `CLI-${String(parties.length + 1).padStart(3, '0')}`,
      name: client.name,
      phone: client.phone || null,
      notes: client.notes || null,
      is_deleted: false,
      created_at: new Date().toISOString()
    };
    setParties(prev => [...prev, newParty]);
    logAudit('Création Client', 'Répertoire Clients', `Nouveau producteur: ${newParty.name} (${newParty.code})`, newParty.id);
  };

  const handleDownloadZip = () => {
    // Direct link to the generated zip archive
    window.location.href = '/huilerie-jemai-erp-latest.zip';
  };

  const queueCount = receptions.filter(r => r.status === 'EN_FILE').length;
  const alertTanksCount = tankDetails.filter(t => t.is_alert).length;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col text-stone-900 font-sans selection:bg-amber-200">
      {/* Top Navbar */}
      <Navbar
        settings={appSettings}
        profiles={profiles}
        currentProfile={currentProfile}
        lang={lang}
        isOnline={isOnline}
        onToggleLanguage={() => setLang(l => (l === 'fr' ? 'ar' : 'fr'))}
        onSwitchProfile={(p) => setCurrentProfile(p)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-row">
        {/* Sidebar */}
        <Sidebar
          activeModule={activeModule}
          lang={lang}
          queueCount={queueCount}
          alertTanksCount={alertTanksCount}
          onSelectModule={(m) => setActiveModule(m)}
        />

        {/* Workspace View */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Header Summary for Current Active Module */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {activeModule === 'CUVES' && translations[lang].cuvesTitle}
              {activeModule === 'RECEPTIONS' && translations[lang].receptionTitle}
              {activeModule === 'PRODUCTION' && translations[lang].productionTitle}
              {activeModule === 'CUSTOMER_HISTORY' && translations[lang].customerHistoryTitle}
              {activeModule === 'GRIGNONS' && translations[lang].grignonsTitle}
              {activeModule === 'PURCHASES' && (lang === 'ar' ? 'سجل مشتريات المعصرة (زيتون وزيت)' : 'Achats & Approvisionnements (BON-ACH)')}
              {activeModule === 'FINANCES' && (lang === 'ar' ? 'الصندوق والمالية العامة للمعصرة' : 'Caisse & Gestion Financière ERP')}
              {activeModule === 'OPERATIONS' && 'Journal des Mouvements & Bons de Stock'}
              {activeModule === 'CLIENTS' && 'Répertoire des Producteurs & Soldes de Stock'}
              {activeModule === 'TESTS' && (lang === 'ar' ? 'بنك الاختبارات الآلي (16 سيناريو)' : 'Banc d’Essai Automatisé (16 Scénarios Validés)')}
              {activeModule === 'SETTINGS' && 'Paramètres Généraux, Traçabilité & Sauvegarde'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              {activeModule === 'CUVES' && translations[lang].cuvesSubtitle}
              {activeModule === 'RECEPTIONS' && translations[lang].receptionSubtitle}
              {activeModule === 'PRODUCTION' && translations[lang].productionSubtitle}
              {activeModule === 'CUSTOMER_HISTORY' && translations[lang].customerHistorySubtitle}
              {activeModule === 'GRIGNONS' && translations[lang].grignonsSubtitle}
              {activeModule === 'PURCHASES' && (lang === 'ar' ? 'إدارة المشتريات المباشرة للفلاحة والمزودين لحساب المعصرة' : 'Suivi des achats d’olives et d’huile pour compte propre de l’huilerie')}
              {activeModule === 'FINANCES' && (lang === 'ar' ? 'متابعة مقابيض العصر، مبيعات الفيتورة، المصاريف والسيولة الصافية' : 'Suivi des recettes de mouture, ventes de grignons, dépenses d’exploitation et solde de trésorerie')}
              {activeModule === 'OPERATIONS' && 'Historique complet des réceptions, sorties et transferts entre cuves'}
              {activeModule === 'CLIENTS' && 'Gestion des fiches producteurs et répartition de leur huile par cuve'}
              {activeModule === 'TESTS' && (lang === 'ar' ? 'اختبار آلي بنقرة واحدة لضمان عدم وجود أي خلل أو تراجع في الأداء' : 'Validation continue en 1 clic : 10 règles de cuverie + 6 workflows de mouture, bascule et grignons')}
              {activeModule === 'SETTINGS' && 'Configuration de l’établissement, synchronisation Supabase et téléchargement ZIP'}
            </p>
          </div>

          {/* Module Views */}
          {activeModule === 'CUVES' && (
            <CuvesGrid
              tanks={tankDetails}
              lang={lang}
              onSelectTank={(tDetail) => setActiveModal({ type: 'TANK_DETAIL', tankDetail: tDetail })}
              onOpenOperation={(opType, preselectedTankId) =>
                setActiveModal({ type: 'STOCK_OPERATION', opType, preselectedTankId })
              }
            />
          )}

          {activeModule === 'RECEPTIONS' && (
            <OliveReceptionsList
              receptions={receptions}
              lang={lang}
              onNewReception={() => setActiveModal({ type: 'OLIVE_RECEPTION' })}
              onSendToQueue={handleSendToQueue}
              onPrintTicket={(rec) => setActiveModal({ type: 'PRINT', docType: 'OLIVE_RECEPTION', data: rec })}
              onExportExcel={() => exportOliveReceptionsToExcel(receptions, appSettings.company_name)}
            />
          )}

          {activeModule === 'PRODUCTION' && (
            <ProductionQueue
              queueReceptions={receptions.filter(r => r.status === 'EN_FILE')}
              productionBatches={productionBatches}
              currentRole={currentProfile.role}
              lang={lang}
              onStartMilling={(rec) => setActiveModal({ type: 'PRODUCTION_ENTRY', reception: rec })}
              onPrintBatch={(b) => setActiveModal({ type: 'PRINT', docType: 'PRODUCTION_TICKET', data: b })}
              onExportExcel={() => exportProductionToExcel(productionBatches, appSettings.company_name)}
            />
          )}

          {activeModule === 'CUSTOMER_HISTORY' && (
            <CustomerProductionLedger
              parties={parties}
              batches={productionBatches}
              tanks={tankDetails}
              lang={lang}
              onPrintStatement={(summary) => setActiveModal({ type: 'PRINT', docType: 'CLIENT_STATEMENT', data: summary })}
              onDepositInTank={handleDepositCustomerOilInTank}
            />
          )}

          {activeModule === 'GRIGNONS' && (
            <GrignonsSalesList
              sales={grignonSales}
              lang={lang}
              onNewSale={() => setActiveModal({ type: 'GRIGNON_SALE' })}
              onPrintSale={(s) => setActiveModal({ type: 'PRINT', docType: 'GRIGNON_SALE', data: s })}
              onExportExcel={() => exportGrignonsToExcel(grignonSales, appSettings.company_name)}
            />
          )}

          {activeModule === 'PURCHASES' && (
            <PurchasesList
              purchases={purchases}
              lang={lang}
              onNewPurchase={() => setActiveModal({ type: 'PURCHASE' })}
              onPrintPurchase={(p) => setActiveModal({ type: 'PRINT', docType: 'PURCHASE_RECEIPT', data: p })}
              onExportExcel={() => exportPurchasesToExcel(purchases, appSettings.company_name)}
            />
          )}

          {activeModule === 'FINANCES' && (
            <FinancesManager
              productionBatches={productionBatches}
              grignonSales={grignonSales}
              purchases={purchases}
              expenses={expenses}
              lang={lang}
              onAddExpense={handleAddExpense}
              onExportExcel={() => {
                const millingCash = productionBatches
                  .filter(b => b.milling_fee_paid && b.milling_fee_mode === 'ESPECES')
                  .reduce((acc, b) => acc + b.milling_fee_total_tnd, 0);
                const grignonsRev = grignonSales
                  .filter(s => s.payment_status === 'PAYE')
                  .reduce((acc, s) => acc + s.total_price_tnd, 0);
                const purchasesTotal = purchases
                  .filter(p => p.payment_status === 'PAYE')
                  .reduce((acc, p) => acc + p.total_price_tnd, 0);
                exportFinancesToExcel(millingCash, grignonsRev, purchasesTotal, expenses, appSettings.company_name);
              }}
            />
          )}

          {activeModule === 'TESTS' && (
            <AutomatedTestSuite />
          )}

          {activeModule === 'OPERATIONS' && (
            <OperationsList
              operations={operations}
              movements={movements}
              parties={parties}
              tanks={tanks}
              currentRole={currentProfile.role}
              lang={lang}
              onPrintOperation={(op, opMvts) => {
                const docType: PrintableDocType = op.type === 'ENTREE' ? 'STOCK_IN' : op.type === 'SORTIE' ? 'STOCK_OUT' : 'STOCK_TRANSFER';
                setActiveModal({
                  type: 'PRINT',
                  docType,
                  data: {
                    ...op,
                    party_name: parties.find(p => p.id === op.party_id)?.name,
                    movements: opMvts.map(m => ({
                      ...m,
                      tank_code: tanks.find(t => t.id === m.tank_id)?.code
                    }))
                  }
                });
              }}
              onCancelOperation={handleCancelOperation}
            />
          )}

          {activeModule === 'CLIENTS' && (
            <ClientsList
              clients={clientStockSummaries}
              lang={lang}
              onNewClient={handleAddNewClient}
              onPrintClientStatement={(clientSummary) => {
                setActiveModal({
                  type: 'PRINT',
                  docType: 'CLIENT_STATEMENT',
                  data: {
                    party_name: clientSummary.party.name,
                    party_code: clientSummary.party.code,
                    total_olives_kg: 0,
                    total_oil_litres: clientSummary.total_quantity,
                    average_yield_percent: 0
                  }
                });
              }}
              onExportExcel={() => exportClientsToExcel(clientStockSummaries, appSettings.company_name)}
            />
          )}

          {activeModule === 'SETTINGS' && (
            <SettingsView
              settings={appSettings}
              profiles={profiles}
              currentRole={currentProfile.role}
              isOnline={isOnline}
              auditLogs={auditLogs}
              lang={lang}
              onSaveSettings={(updated) => setAppSettings(updated)}
              onSyncSupabase={loadInitialData}
              onDownloadZip={handleDownloadZip}
            />
          )}
        </main>
      </div>

      {/* MODALS */}
      {activeModal?.type === 'STOCK_OPERATION' && (
        <OperationModal
          type={activeModal.opType}
          tanks={tankDetails}
          parties={parties}
          currentOperator={currentProfile.display_name}
          preselectedTankId={activeModal.preselectedTankId}
          lang={lang}
          onClose={() => setActiveModal(null)}
          onSubmit={handleSaveStockOperation}
        />
      )}

      {activeModal?.type === 'TANK_DETAIL' && (
        <TankDetailModal
          tankDetail={activeModal.tankDetail}
          movements={movements}
          operations={operations}
          lang={lang}
          onClose={() => setActiveModal(null)}
          onPrint={() => {
            setActiveModal({
              type: 'PRINT',
              docType: 'CLIENT_STATEMENT',
              data: {
                party_name: `FICHE CUVE: ${activeModal.tankDetail.tank.name} (${activeModal.tankDetail.tank.code})`,
                party_code: activeModal.tankDetail.tank.code,
                total_olives_kg: 0,
                total_oil_litres: activeModal.tankDetail.current_quantity,
                average_yield_percent: activeModal.tankDetail.fill_percentage
              }
            });
          }}
        />
      )}

      {activeModal?.type === 'OLIVE_RECEPTION' && (
        <OliveReceptionModal
          parties={parties}
          currentOperator={currentProfile.display_name}
          lang={lang}
          onClose={() => setActiveModal(null)}
          onSubmit={handleSaveOliveReception}
        />
      )}

      {activeModal?.type === 'PRODUCTION_ENTRY' && (
        <ProductionEntryModal
          reception={activeModal.reception}
          tanks={tankDetails}
          currentOperator={currentProfile.display_name}
          defaultDensity={appSettings.oil_density}
          defaultMillingFeePerKg={appSettings.default_milling_fee_per_kg}
          lang={lang}
          onClose={() => setActiveModal(null)}
          onSubmit={handleSaveProductionBatch}
        />
      )}

      {activeModal?.type === 'GRIGNON_SALE' && (
        <GrignonSaleModal
          currentOperator={currentProfile.display_name}
          lang={lang}
          onClose={() => setActiveModal(null)}
          onSubmit={handleSaveGrignonSale}
        />
      )}

      {activeModal?.type === 'PURCHASE' && (
        <PurchaseModal
          tanks={tankDetails}
          currentOperator={currentProfile.display_name}
          lang={lang}
          onClose={() => setActiveModal(null)}
          onSubmit={handleSavePurchase}
        />
      )}

      {activeModal?.type === 'PRINT' && (
        <PrintDocument
          docType={activeModal.docType}
          settings={appSettings}
          data={activeModal.data}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
