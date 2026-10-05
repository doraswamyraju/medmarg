import React, { useState } from 'react';
import { 
  Boxes, PackageCheck, PlusCircle, ShoppingBag, Truck, Bell, Trash2, 
  ShieldCheck, FileText, Plus, AlertTriangle, ShieldAlert
} from 'lucide-react';

// Sub-Tab Modular Components
import StockAndKitsSubTab from './inventory/StockAndKitsSubTab';
import PurchasesInwardSubTab from './inventory/PurchasesInwardSubTab';
import AgentIndentsSubTab from './inventory/AgentIndentsSubTab';
import AgentInventorySubTab from './inventory/AgentInventorySubTab';
import ExtraUsageWaiversSubTab from './inventory/ExtraUsageWaiversSubTab';
import ScrapExpirySubTab from './inventory/ScrapExpirySubTab';
import MoqAlertsSubTab from './inventory/MoqAlertsSubTab';
import VendorsDirectorySubTab from './inventory/VendorsDirectorySubTab';

// Modal Components
import { 
  AddStockModal, 
  AddPurchaseModal, 
  CreateIndentModal, 
  DirectAllocateModal, 
  ScrapModal, 
  MoqConfigModal 
} from './inventory/InventoryModals';

export default function StockInventoryTab({
  inventoryStock: initialStock = [],
  setInventoryStock: parentSetInventoryStock = () => {},
  indents: initialIndents = [],
  setIndents: parentSetIndents = () => {},
  salariedAgents = [],
  freelancers = [],
  subTab: propSubTab,
  setSubTab: propSetSubTab,
  API_BASE,
  safeFetch
}) {
  // Active Sub-tab State (Controlled by sidebar or internal)
  const [localSubTab, setLocalSubTab] = useState('STOCK_KITS');
  const subTab = propSubTab !== undefined ? propSubTab : localSubTab;
  const setSubTab = propSetSubTab || setLocalSubTab;

  // Master Stock & Kits State
  const [inventoryStock, setInventoryStock] = useState(
    initialStock.length > 0 ? initialStock : [
      { code: 'STK-01', name: 'Gold SST Gel Tubes (5ml)', type: 'SINGLE', category: 'Blood Containers', stock: 4500, unit: 'Tubes', reorderLevel: 1000, unitCost: 14, incharge: 'Anand Store Lead (store.tirupati@medmarg.com)', alertSent: true },
      { code: 'STK-02', name: 'Purple EDTA Tubes (3ml)', type: 'SINGLE', category: 'Blood Containers', stock: 3200, unit: 'Tubes', reorderLevel: 800, unitCost: 12, incharge: 'Anand Store Lead (store.tirupati@medmarg.com)', alertSent: false },
      { code: 'STK-03', name: 'Grey Fluoride Glucose Tubes (2ml)', type: 'SINGLE', category: 'Blood Containers', stock: 2100, unit: 'Tubes', reorderLevel: 500, unitCost: 12, incharge: 'Anand Store Lead (store.tirupati@medmarg.com)', alertSent: false },
      { code: 'STK-04', name: 'Sterile Vacutainer Needles 21G', type: 'SINGLE', category: 'Phlebotomy Supplies', stock: 5000, unit: 'Needles', reorderLevel: 1200, unitCost: 6, incharge: 'Kiran Ops Lead (kiran.ops@medmarg.com)', alertSent: false },
      { code: 'STK-05', name: 'Sterile Butterfly Needles 23G', type: 'SINGLE', category: 'Phlebotomy Supplies', stock: 450, unit: 'Needles', reorderLevel: 600, unitCost: 22, incharge: 'Kiran Ops Lead (kiran.ops@medmarg.com)', alertSent: true },
      { code: 'STK-06', name: 'Alcohol Prep Swabs (70% IPA)', type: 'SINGLE', category: 'Disinfectants & Swabs', stock: 8500, unit: 'Swabs', reorderLevel: 2000, unitCost: 1.5, incharge: 'Anand Store Lead (store.tirupati@medmarg.com)', alertSent: false },
      { code: 'STK-07', name: 'IoT Cold Gel Carry Bags (2-8°C)', type: 'SINGLE', category: 'Cold Chain Equipment', stock: 150, unit: 'Bags', reorderLevel: 30, unitCost: 850, incharge: 'Anand Store Lead (store.tirupati@medmarg.com)', alertSent: false },
      { code: 'STK-08', name: 'Biohazard Yellow Bags (Barcoded)', type: 'SINGLE', category: 'Waste Management', stock: 3800, unit: 'Bags', reorderLevel: 1000, unitCost: 4, incharge: 'Anand Store Lead (store.tirupati@medmarg.com)', alertSent: false },
      { code: 'STK-09', name: 'Thermal Sample Barcode Stickers (Roll of 500)', type: 'SINGLE', category: 'Barcodes & Stationery', stock: 85, unit: 'Rolls', reorderLevel: 20, unitCost: 120, incharge: 'Anand Store Lead (store.tirupati@medmarg.com)', alertSent: false },
      
      // Combo Kits (Combination of Single Items)
      { 
        code: 'KIT-101', 
        name: 'Routine Full Body Health Kit', 
        type: 'KIT', 
        category: 'Pre-Packaged Kits', 
        stock: 350, 
        unit: 'Kits', 
        reorderLevel: 100, 
        unitCost: 48,
        incharge: 'Anand Store Lead (store.tirupati@medmarg.com)',
        alertSent: false,
        components: [
          { itemCode: 'STK-01', name: 'Gold SST Gel Tube', qty: 1 },
          { itemCode: 'STK-02', name: 'Purple EDTA Tube', qty: 1 },
          { itemCode: 'STK-04', name: 'Sterile 21G Needle', qty: 1 },
          { itemCode: 'STK-06', name: 'Alcohol Swab', qty: 2 },
          { itemCode: 'STK-08', name: 'Biohazard Bag', qty: 1 }
        ]
      },
      { 
        code: 'KIT-102', 
        name: 'Comprehensive Diabetic & Lipid Kit', 
        type: 'KIT', 
        category: 'Pre-Packaged Kits', 
        stock: 220, 
        unit: 'Kits', 
        reorderLevel: 80, 
        unitCost: 62,
        incharge: 'Anand Store Lead (store.tirupati@medmarg.com)',
        alertSent: false,
        components: [
          { itemCode: 'STK-01', name: 'Gold SST Tube', qty: 1 },
          { itemCode: 'STK-02', name: 'Purple EDTA Tube', qty: 1 },
          { itemCode: 'STK-03', name: 'Grey Fluoride Tube', qty: 1 },
          { itemCode: 'STK-04', name: 'Sterile 21G Needle', qty: 1 },
          { itemCode: 'STK-06', name: 'Alcohol Swabs', qty: 2 }
        ]
      },
      { 
        code: 'KIT-103', 
        name: 'Phlebotomist Monthly Starter Bag Kit', 
        type: 'KIT', 
        category: 'Pre-Packaged Kits', 
        stock: 18, 
        unit: 'Kits', 
        reorderLevel: 25, 
        unitCost: 1850,
        incharge: 'Kiran Ops Lead (kiran.ops@medmarg.com)',
        alertSent: true,
        components: [
          { itemCode: 'STK-01', name: 'Gold SST Tube', qty: 50 },
          { itemCode: 'STK-02', name: 'Purple EDTA Tube', qty: 30 },
          { itemCode: 'STK-03', name: 'Grey Fluoride Tube', qty: 20 },
          { itemCode: 'STK-04', name: 'Sterile 21G Needles', qty: 100 },
          { itemCode: 'STK-06', name: 'Alcohol Swabs', qty: 100 },
          { itemCode: 'STK-07', name: 'IoT Cold Bag', qty: 1 },
          { itemCode: 'STK-09', name: 'Barcode Roll', qty: 2 }
        ]
      }
    ]
  );

  // Purchases / Inward Goods State (GRN)
  const [purchases, setPurchases] = useState([
    {
      id: 'GRN-2026-881',
      poNumber: 'PO-MM-4401',
      vendor: 'Becton Dickinson (BD India Pvt Ltd)',
      invoiceNo: 'INV-BD-99201',
      inwardDate: 'Today 09:15 AM',
      batchNo: 'BD-26G-881',
      mfgDate: '2026-01-10',
      expDate: '2027-06-30',
      itemsCount: 2,
      details: '2,000x Gold SST Tubes, 1,500x Purple EDTA Tubes',
      totalAmount: 46000,
      receivedBy: 'Anand Store Lead',
      qcStatus: 'PASSED_VERIFIED'
    },
    {
      id: 'GRN-2026-880',
      poNumber: 'PO-MM-4395',
      vendor: 'Polymedicure Ltd (PolyMed)',
      invoiceNo: 'PM-88301',
      inwardDate: 'Yesterday 04:30 PM',
      batchNo: 'PM-26N-412',
      mfgDate: '2026-02-01',
      expDate: '2028-01-31',
      itemsCount: 1,
      details: '5,000x Sterile Vacutainer Needles 21G',
      totalAmount: 30000,
      receivedBy: 'Kiran Ops Lead',
      qcStatus: 'PASSED_VERIFIED'
    },
    {
      id: 'GRN-2026-879',
      poNumber: 'PO-MM-4390',
      vendor: 'Microbar Cold Chain Solutions',
      invoiceNo: 'MB-10294',
      inwardDate: '3 Oct 2026',
      batchNo: 'MB-BAG-09',
      mfgDate: '2026-03-01',
      expDate: '2030-12-31',
      itemsCount: 1,
      details: '50x IoT Cold Gel Carry Bags (2-8°C)',
      totalAmount: 42500,
      receivedBy: 'Anand Store Lead',
      qcStatus: 'PASSED_VERIFIED'
    }
  ]);

  // Indents State
  const [indents, setIndents] = useState(
    initialIndents.length > 0 ? initialIndents : [
      { 
        id: 'IND-501', 
        agentType: 'SALARIED_AGENT',
        agentName: 'Ramesh Kumar (AG-01)', 
        area: 'Air Bypass & Alipiri',
        requestedItems: '50x Gold SST Tubes, 20x Purple EDTA Tubes, 50x Needles', 
        status: 'PENDING_APPROVAL', 
        date: 'Today 08:30 AM',
        paymentMode: 'Company Quota Allocation (Free)'
      },
      { 
        id: 'IND-502', 
        agentType: 'FREELANCE_AGENT',
        agentName: 'Sneha Reddy (FL-102)', 
        area: 'Tirupati Central Zone',
        requestedItems: '1x Routine Full Body Health Kit, 20x Purple EDTA Tubes', 
        status: 'PENDING_APPROVAL', 
        date: 'Today 07:45 AM',
        paymentMode: 'Deduct from Registration Wallet Credits (₹288)'
      },
      { 
        id: 'IND-503', 
        agentType: 'SALARIED_AGENT',
        agentName: 'Suresh Babu (AG-02)', 
        area: 'Renigunta Rd & Tiruchanoor',
        requestedItems: '30x Purple EDTA Tubes, 10x Biohazard Bags', 
        status: 'APPROVED_DISPATCHED', 
        date: 'Yesterday 06:15 PM',
        paymentMode: 'Company Quota Allocation (Free)'
      }
    ]
  );

  // Agent In-Hand Inventory State
  const [agentInventories, setAgentInventories] = useState([
    {
      agentId: 'AG-01',
      agentName: 'Ramesh Kumar',
      agentType: 'Salaried Agent',
      phone: '+91 98765 11223',
      zone: 'Zone 1: Tirupati Central',
      inHandStock: {
        sstTubes: 18,
        edtaTubes: 14,
        fluorideTubes: 8,
        needles21g: 22,
        butterfly23g: 3,
        swabs: 40,
        fullBodyKits: 4,
        coldBagTemp: '4.2°C',
        barcodeRolls: 1
      },
      lastRefillDate: 'Yesterday 09:00 AM',
      warning: null
    },
    {
      agentId: 'AG-02',
      agentName: 'Suresh Babu',
      agentType: 'Salaried Agent',
      phone: '+91 98765 44332',
      zone: 'Zone 2: Alipiri & SVU',
      inHandStock: {
        sstTubes: 4,
        edtaTubes: 12,
        fluorideTubes: 6,
        needles21g: 8,
        butterfly23g: 1,
        swabs: 25,
        fullBodyKits: 1,
        coldBagTemp: '3.8°C',
        barcodeRolls: 1
      },
      lastRefillDate: '2 Days Ago',
      warning: 'Low SST Tubes (< 5)'
    },
    {
      agentId: 'FL-101',
      agentName: 'K. Venkatesh',
      agentType: 'Freelance Agent',
      phone: '+91 98765 22114',
      zone: 'Zone 4: Chandragiri & Outer Suburbs',
      inHandStock: {
        sstTubes: 15,
        edtaTubes: 10,
        fluorideTubes: 5,
        needles21g: 20,
        butterfly23g: 4,
        swabs: 30,
        fullBodyKits: 3,
        coldBagTemp: '4.8°C',
        barcodeRolls: 1
      },
      lastRefillDate: '3 Oct 2026',
      warning: null
    },
    {
      agentId: 'FL-102',
      agentName: 'Sneha Reddy',
      agentType: 'Freelance Agent',
      phone: '+91 98765 33221',
      zone: 'Tirupati Central Zone',
      inHandStock: {
        sstTubes: 8,
        edtaTubes: 6,
        fluorideTubes: 4,
        needles21g: 10,
        butterfly23g: 0,
        swabs: 15,
        fullBodyKits: 0,
        coldBagTemp: '4.1°C',
        barcodeRolls: 1
      },
      lastRefillDate: '4 Oct 2026',
      warning: 'No Butterfly Needles remaining'
    }
  ]);

  // Extra Consumables & Wastage Review Desk State
  const [extraUsages, setExtraUsages] = useState([
    {
      id: 'EX-901',
      orderId: 'MM-8921',
      patientName: 'Rahul Sharma',
      agentId: 'AG-01',
      agentName: 'Ramesh Kumar (Salaried)',
      agentType: 'SALARIED',
      reportedAt: 'Today 08:50 AM',
      itemsUsed: [
        { name: 'Alcohol Prep Swab', qty: 2, unitPrice: 1.5 },
        { name: 'Butterfly Needle 23G', qty: 1, unitPrice: 22 }
      ],
      totalValue: 25.0,
      phleboReason: 'Patient had deep, collapsed veins. First 21G attempt failed; used 23G butterfly with extra swab.',
      decision: 'PENDING',
      decisionNotes: '',
      decidedBy: null
    },
    {
      id: 'EX-902',
      orderId: 'MM-8924',
      patientName: 'K. Suneetha Devi',
      agentId: 'FL-102',
      agentName: 'Sneha Reddy (Freelancer)',
      agentType: 'FREELANCE',
      reportedAt: 'Today 09:10 AM',
      itemsUsed: [
        { name: 'Gold SST Gel Tube', qty: 1, unitPrice: 14.0 },
        { name: 'Alcohol Prep Swab', qty: 1, unitPrice: 1.5 }
      ],
      totalValue: 15.5,
      phleboReason: 'Tube vacuum compromised due to defective stopper rubber during draw. Switched to backup tube.',
      decision: 'WAIVED_CLINICAL_BUFFER',
      decisionNotes: 'Verified manufacturer vacuum failure. Approved under MedMarg clinical buffer waiver.',
      decidedBy: 'Super Admin'
    },
    {
      id: 'EX-903',
      orderId: 'MM-8919',
      patientName: 'V. Prakash Rao',
      agentId: 'FL-101',
      agentName: 'K. Venkatesh (Freelancer)',
      agentType: 'FREELANCE',
      reportedAt: 'Yesterday 05:20 PM',
      itemsUsed: [
        { name: 'Sterile Vacutainer Needles 21G', qty: 3, unitPrice: 6.0 }
      ],
      totalValue: 18.0,
      phleboReason: 'Dropped needle pack on floor during unpacking in patient room.',
      decision: 'CHARGED_AGENT',
      decisionNotes: 'Carelessness during sterile handling. Charged ₹18 to Freelancer Wallet.',
      decidedBy: 'Super Admin'
    }
  ]);

  // Scrap, Damaged & Expiry Logs
  const [scrapLogs, setScrapLogs] = useState([
    {
      id: 'SCR-401',
      date: 'Today 09:00 AM',
      itemCode: 'STK-02',
      itemName: 'Purple EDTA Tubes (3ml)',
      batchNo: 'EDTA-24-998',
      quantity: 40,
      reason: 'Batch Expiry Reached (Anticoagulant degradation)',
      lossValue: 480,
      loggedBy: 'Anand Store Lead',
      actionTaken: 'Safely Incinerated via Bio-Medical Waste Agency'
    },
    {
      id: 'SCR-402',
      date: 'Yesterday 02:15 PM',
      itemCode: 'STK-01',
      itemName: 'Gold SST Gel Tubes (5ml)',
      batchNo: 'SST-25-112',
      quantity: 12,
      reason: 'Transit Vibration Hemolysis / Broken Vacuum',
      lossValue: 168,
      loggedBy: 'Kiran Ops Lead',
      actionTaken: 'Stock Written Off from Central Warehouse'
    }
  ]);

  // Suppliers / Vendors Master
  const [vendors, setVendors] = useState([
    {
      code: 'VND-01',
      name: 'Becton Dickinson (BD India Pvt Ltd)',
      category: 'Vacutainers & Needles',
      contactPerson: 'Rajesh Mehra',
      phone: '+91 98110 55443',
      email: 'orders.south@bd.com',
      gstin: '37AABCB1234F1Z8',
      leadTimeDays: 3,
      paymentTerms: 'Net 30 Days',
      rating: '4.9 ★'
    },
    {
      code: 'VND-02',
      name: 'Polymedicure Ltd (PolyMed)',
      category: 'Syringes, Needles & Butterfly Sets',
      contactPerson: 'Srinivas Varma',
      phone: '+91 98480 77665',
      email: 'srinivas@polymedmedical.com',
      gstin: '37AACCP9876K1Z2',
      leadTimeDays: 2,
      paymentTerms: 'Net 15 Days',
      rating: '4.8 ★'
    },
    {
      code: 'VND-03',
      name: 'Microbar Cold Chain Solutions',
      category: 'IoT Carry Bags & Gel Packs',
      contactPerson: 'Pradeep Nayak',
      phone: '+91 99000 88221',
      email: 'pradeep@microbartech.com',
      gstin: '29AABCM5544L1Z9',
      leadTimeDays: 5,
      paymentTerms: '100% Advance',
      rating: '4.7 ★'
    }
  ]);

  // Modal Visibility States
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
  const [showCreateIndentModal, setShowCreateIndentModal] = useState(false);
  const [showDirectAllocateModal, setShowDirectAllocateModal] = useState(false);
  const [showScrapModal, setShowScrapModal] = useState(false);
  const [showInchargeConfigModal, setShowInchargeConfigModal] = useState(false);
  const [selectedStockForConfig, setSelectedStockForConfig] = useState(null);

  // Forms
  const [stockForm, setStockForm] = useState({
    code: `STK-0${inventoryStock.length + 1}`,
    name: '',
    type: 'SINGLE',
    category: 'Blood Containers',
    stock: 1000,
    unit: 'Tubes',
    reorderLevel: 300,
    unitCost: 15,
    incharge: 'Anand Store Lead (store.tirupati@medmarg.com)'
  });

  const [purchaseForm, setPurchaseForm] = useState({
    poNumber: `PO-MM-${Math.floor(4400 + Math.random() * 100)}`,
    vendor: 'Becton Dickinson (BD India Pvt Ltd)',
    invoiceNo: '',
    batchNo: '',
    mfgDate: '',
    expDate: '',
    itemCode: 'STK-01',
    quantity: 1000,
    unitCost: 14,
    receivedBy: 'Anand Store Lead'
  });

  const [indentForm, setIndentForm] = useState({
    id: `IND-${Math.floor(500 + Math.random() * 500)}`,
    agentName: 'Ramesh Kumar (AG-01)',
    agentType: 'SALARIED_AGENT',
    area: 'Tirupati Central',
    requestedItems: '50x Gold SST Tubes, 20x Purple EDTA Tubes',
    paymentMode: 'Company Quota Allocation (Free)'
  });

  const [allocateForm, setAllocateForm] = useState({
    agentId: 'AG-01',
    itemCode: 'STK-01',
    quantity: 50,
    notes: 'Shift Routine Refill'
  });

  const [scrapForm, setScrapForm] = useState({
    itemCode: 'STK-01',
    batchNo: 'SST-2026-09',
    quantity: 10,
    reason: 'Defective Vacuum / Damaged Stopper'
  });

  // Action Handlers
  const handleSaveNewStock = (e) => {
    e.preventDefault();
    const newItem = {
      ...stockForm,
      stock: Number(stockForm.stock) || 1000,
      reorderLevel: Number(stockForm.reorderLevel) || 300,
      unitCost: Number(stockForm.unitCost) || 15,
      alertSent: false
    };
    const updated = [newItem, ...inventoryStock];
    setInventoryStock(updated);
    parentSetInventoryStock(updated);
    setShowAddStockModal(false);
  };

  const handleSavePurchase = (e) => {
    e.preventDefault();
    const targetItem = inventoryStock.find(i => i.code === purchaseForm.itemCode);
    const qty = Number(purchaseForm.quantity) || 1000;
    const cost = Number(purchaseForm.unitCost) || 14;
    const total = qty * cost;

    const newPurchase = {
      id: `GRN-2026-${Math.floor(885 + Math.random() * 100)}`,
      poNumber: purchaseForm.poNumber,
      vendor: purchaseForm.vendor,
      invoiceNo: purchaseForm.invoiceNo || `INV-${Math.floor(10000 + Math.random() * 90000)}`,
      inwardDate: `Today ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      batchNo: purchaseForm.batchNo || `BATCH-26-${Math.floor(100 + Math.random() * 900)}`,
      mfgDate: purchaseForm.mfgDate || '2026-02-01',
      expDate: purchaseForm.expDate || '2028-01-31',
      itemsCount: 1,
      details: `${qty.toLocaleString()}x ${targetItem ? targetItem.name : purchaseForm.itemCode}`,
      totalAmount: total,
      receivedBy: purchaseForm.receivedBy,
      qcStatus: 'PASSED_VERIFIED'
    };

    setPurchases(prev => [newPurchase, ...prev]);

    const updatedStock = inventoryStock.map(s => {
      if (s.code === purchaseForm.itemCode) {
        return { ...s, stock: s.stock + qty, unitCost: cost };
      }
      return s;
    });
    setInventoryStock(updatedStock);
    parentSetInventoryStock(updatedStock);
    setShowAddPurchaseModal(false);
  };

  const handleApproveIndent = (ind) => {
    const updatedStock = inventoryStock.map(s => {
      if (s.code === 'STK-01') return { ...s, stock: Math.max(0, s.stock - 50) };
      if (s.code === 'STK-02') return { ...s, stock: Math.max(0, s.stock - 20) };
      if (s.code === 'STK-04') return { ...s, stock: Math.max(0, s.stock - 50) };
      return s;
    });
    setInventoryStock(updatedStock);
    parentSetInventoryStock(updatedStock);

    const updatedIndents = indents.map(i => i.id === ind.id ? { ...i, status: 'APPROVED_DISPATCHED' } : i);
    setIndents(updatedIndents);
    parentSetIndents(updatedIndents);
  };

  const handleCreateIndentSubmit = (e) => {
    e.preventDefault();
    const newIndent = {
      ...indentForm,
      date: `Today ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      status: 'PENDING_APPROVAL'
    };
    const updated = [newIndent, ...indents];
    setIndents(updated);
    parentSetIndents(updated);
    setShowCreateIndentModal(false);
  };

  const handleDecideExtraUsage = (usageId, decision, notes) => {
    setExtraUsages(prev => prev.map(u => {
      if (u.id === usageId) {
        return {
          ...u,
          decision,
          decisionNotes: notes || (decision === 'WAIVED_CLINICAL_BUFFER' ? 'Allowed clinical waste by Admin' : 'Excess consumable billed to Agent Wallet'),
          decidedBy: 'Super Admin'
        };
      }
      return u;
    }));
  };

  const handleDirectAllocate = (e) => {
    e.preventDefault();
    const qty = Number(allocateForm.quantity) || 10;
    
    setInventoryStock(prev => prev.map(s => s.code === allocateForm.itemCode ? { ...s, stock: Math.max(0, s.stock - qty) } : s));
    
    setAgentInventories(prev => prev.map(ag => {
      if (ag.agentId === allocateForm.agentId) {
        const stockKey = allocateForm.itemCode === 'STK-01' ? 'sstTubes' : 
                         allocateForm.itemCode === 'STK-02' ? 'edtaTubes' : 
                         allocateForm.itemCode === 'STK-03' ? 'fluorideTubes' : 'needles21g';
        return {
          ...ag,
          inHandStock: {
            ...ag.inHandStock,
            [stockKey]: (ag.inHandStock[stockKey] || 0) + qty
          },
          lastRefillDate: 'Just Now',
          warning: null
        };
      }
      return ag;
    }));

    setShowDirectAllocateModal(false);
  };

  const handleSaveScrap = (e) => {
    e.preventDefault();
    const item = inventoryStock.find(i => i.code === scrapForm.itemCode);
    const qty = Number(scrapForm.quantity) || 10;
    const loss = (item ? item.unitCost : 14) * qty;

    const newScrap = {
      id: `SCR-${Math.floor(400 + Math.random() * 500)}`,
      date: `Today ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      itemCode: scrapForm.itemCode,
      itemName: item ? item.name : scrapForm.itemCode,
      batchNo: scrapForm.batchNo,
      quantity: qty,
      reason: scrapForm.reason,
      lossValue: loss,
      loggedBy: 'Super Admin',
      actionTaken: 'Written Off from Inventory & Transferred to Bio-Hazard Scrap Disposal'
    };

    setScrapLogs(prev => [newScrap, ...prev]);
    setInventoryStock(prev => prev.map(s => s.code === scrapForm.itemCode ? { ...s, stock: Math.max(0, s.stock - qty) } : s));
    setShowScrapModal(false);
  };

  const handleSendMoqAlertNotification = (item) => {
    setInventoryStock(prev => prev.map(s => s.code === item.code ? { ...s, alertSent: true } : s));
    alert(`🚨 LOW STOCK ALERT DISPATCHED!\n\nItem: ${item.name} (${item.code})\nCurrent Stock: ${item.stock} ${item.unit}\nReorder Threshold (MOQ): ${item.reorderLevel} ${item.unit}\n\nEmail & Push Notification sent to designated store in-charge: ${item.incharge}`);
  };

  // Metrics
  const totalStockItems = inventoryStock.length;
  const lowStockItemsCount = inventoryStock.filter(s => s.stock <= s.reorderLevel).length;
  const pendingIndentsCount = indents.filter(i => i.status === 'PENDING_APPROVAL').length;
  const pendingExtraUsagesCount = extraUsages.filter(u => u.decision === 'PENDING').length;

  return (
    <div style={{ color: '#0F172A', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* TOP BANNER / KPI OVERVIEW */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Master Inventory & Phlebotomy Supply Chain</h2>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: '800' }}>
              Omnipresent Control
            </span>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.3rem', marginBottom: 0 }}>
            Central warehouse consumables, combo kits, agent in-hand bags, vendor inwarding (GRN), and allowed clinical waste policies.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowAddStockModal(true)}
            style={{ padding: '0.6rem 1rem', backgroundColor: '#FFFFFF', color: '#006B70', border: '1.5px solid #006B70', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}
          >
            <Plus size={15} color="#006B70" /> Add Stock / Kit
          </button>
          
          <button
            onClick={() => setShowAddPurchaseModal(true)}
            style={{ padding: '0.6rem 1.1rem', backgroundColor: '#0284C7', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(2,132,199,0.25)' }}
          >
            <ShoppingBag size={15} color="#FFF" /> Record Purchase (GRN)
          </button>

          <button
            onClick={() => setShowCreateIndentModal(true)}
            style={{ padding: '0.6rem 1.15rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 14px rgba(0,107,112,0.25)' }}
          >
            <PlusCircle size={15} color="#FBBF24" /> Create Indent
          </button>
        </div>
      </div>

      {/* QUICK KPI BAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#006B70' }}>
            <Boxes size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>TOTAL CATALOG SKUs</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A' }}>{totalStockItems} <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 'normal' }}>Items & Kits</span></div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: lowStockItemsCount > 0 ? '1.5px solid #F59E0B' : '1px solid #E2E8F0', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>BELOW MOQ / LOW STOCK</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#D97706' }}>{lowStockItemsCount} <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: '800' }}>Alerts</span></div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
            <PackageCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>AGENT INDENTS QUEUE</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#2563EB' }}>{pendingIndentsCount} <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 'normal' }}>Pending</span></div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#FDF2F8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DB2777' }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>EXTRA USAGE / WAIVERS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#DB2777' }}>{pendingExtraUsagesCount} <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 'normal' }}>Reviews</span></div>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION BAR */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '0.4rem', marginBottom: '1.5rem', display: 'flex', gap: '0.35rem', overflowX: 'auto' }}>
        {[
          { id: 'STOCK_KITS', label: '1. Stock & Kits', icon: Boxes, badge: null },
          { id: 'PURCHASES', label: '2. Purchases (GRN)', icon: ShoppingBag, badge: purchases.length },
          { id: 'INDENTS', label: '3. Agent Indents', icon: PackageCheck, badge: pendingIndentsCount > 0 ? pendingIndentsCount : null, badgeColor: '#EF4444' },
          { id: 'AGENT_INVENTORY', label: '4. Agent Bags & In-Hand', icon: Truck, badge: agentInventories.length },
          { id: 'EXTRA_USAGE_WASTE', label: '5. Extra Usage & Waivers', icon: ShieldCheck, badge: pendingExtraUsagesCount > 0 ? pendingExtraUsagesCount : null, badgeColor: '#EC4899' },
          { id: 'SCRAP_EXPIRY', label: '6. Scrap & Expiry Log', icon: Trash2, badge: scrapLogs.length },
          { id: 'MOQ_ALERTS', label: '7. MOQ & In-Charge Alerts', icon: Bell, badge: lowStockItemsCount > 0 ? lowStockItemsCount : null, badgeColor: '#F59E0B' },
          { id: 'VENDORS', label: '8. Suppliers & Vendors', icon: FileText, badge: vendors.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              style={{
                padding: '0.65rem 1rem',
                border: 'none',
                borderRadius: '10px',
                backgroundColor: isActive ? '#006B70' : 'transparent',
                color: isActive ? '#FFFFFF' : '#475569',
                fontWeight: isActive ? '900' : '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 4px 10px rgba(0,107,112,0.2)' : 'none'
              }}
            >
              <Icon size={16} color={isActive ? '#FBBF24' : '#64748B'} />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span style={{
                  fontSize: '0.68rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '10px',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : (tab.badgeColor || '#E2E8F0'),
                  color: isActive ? '#FFF' : (tab.badgeColor ? '#FFF' : '#334155'),
                  fontWeight: '800'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODULAR SUB-TAB ROUTING */}
      {/* ========================================================================= */}

      {/* SUB-TAB 1: Stock & Combo Kits */}
      {subTab === 'STOCK_KITS' && (
        <StockAndKitsSubTab
          inventoryStock={inventoryStock}
          onOpenAddModal={() => setShowAddStockModal(true)}
          onOpenConfigModal={(stk) => {
            setSelectedStockForConfig(stk);
            setShowInchargeConfigModal(true);
          }}
          onSendMoqAlert={handleSendMoqAlertNotification}
        />
      )}

      {/* SUB-TAB 2: Purchases / Inward GRN */}
      {subTab === 'PURCHASES' && (
        <PurchasesInwardSubTab
          purchases={purchases}
          onOpenAddPurchase={() => setShowAddPurchaseModal(true)}
        />
      )}

      {/* SUB-TAB 3: Agent Indents & Approvals */}
      {subTab === 'INDENTS' && (
        <AgentIndentsSubTab
          indents={indents}
          onApproveIndent={handleApproveIndent}
          onOpenCreateIndent={() => setShowCreateIndentModal(true)}
        />
      )}

      {/* SUB-TAB 4: Agent In-Hand Inventory */}
      {subTab === 'AGENT_INVENTORY' && (
        <AgentInventorySubTab
          agentInventories={agentInventories}
          onOpenDirectAllocate={(agentId) => {
            if (agentId) setAllocateForm(prev => ({ ...prev, agentId }));
            setShowDirectAllocateModal(true);
          }}
        />
      )}

      {/* SUB-TAB 5: Extra Consumable Usage & Clinical Waivers */}
      {subTab === 'EXTRA_USAGE_WASTE' && (
        <ExtraUsageWaiversSubTab
          extraUsages={extraUsages}
          onDecideExtraUsage={handleDecideExtraUsage}
        />
      )}

      {/* SUB-TAB 6: Scrap & Expiry Log */}
      {subTab === 'SCRAP_EXPIRY' && (
        <ScrapExpirySubTab
          scrapLogs={scrapLogs}
          onOpenScrapModal={() => setShowScrapModal(true)}
        />
      )}

      {/* SUB-TAB 7: MOQ & Store In-Charge Alerts */}
      {subTab === 'MOQ_ALERTS' && (
        <MoqAlertsSubTab
          inventoryStock={inventoryStock}
          onSendMoqAlert={handleSendMoqAlertNotification}
          onOpenRaisePo={(itemCode) => {
            setPurchaseForm(prev => ({ ...prev, itemCode }));
            setShowAddPurchaseModal(true);
          }}
        />
      )}

      {/* SUB-TAB 8: Suppliers & Vendors Directory */}
      {subTab === 'VENDORS' && (
        <VendorsDirectorySubTab
          vendors={vendors}
          onOpenCreatePo={(vendorName) => {
            setPurchaseForm(prev => ({ ...prev, vendor: vendorName }));
            setShowAddPurchaseModal(true);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* REUSABLE MODALS */}
      {/* ========================================================================= */}
      <AddStockModal
        show={showAddStockModal}
        onClose={() => setShowAddStockModal(false)}
        stockForm={stockForm}
        setStockForm={setStockForm}
        onSave={handleSaveNewStock}
      />

      <AddPurchaseModal
        show={showAddPurchaseModal}
        onClose={() => setShowAddPurchaseModal(false)}
        purchaseForm={purchaseForm}
        setPurchaseForm={setPurchaseForm}
        vendors={vendors}
        inventoryStock={inventoryStock}
        onSave={handleSavePurchase}
      />

      <CreateIndentModal
        show={showCreateIndentModal}
        onClose={() => setShowCreateIndentModal(false)}
        indentForm={indentForm}
        setIndentForm={setIndentForm}
        onSubmit={handleCreateIndentSubmit}
      />

      <DirectAllocateModal
        show={showDirectAllocateModal}
        onClose={() => setShowDirectAllocateModal(false)}
        allocateForm={allocateForm}
        setAllocateForm={setAllocateForm}
        agentInventories={agentInventories}
        inventoryStock={inventoryStock}
        onSave={handleDirectAllocate}
      />

      <ScrapModal
        show={showScrapModal}
        onClose={() => setShowScrapModal(false)}
        scrapForm={scrapForm}
        setScrapForm={setScrapForm}
        inventoryStock={inventoryStock}
        onSave={handleSaveScrap}
      />

      <MoqConfigModal
        show={showInchargeConfigModal}
        onClose={() => setShowInchargeConfigModal(false)}
        selectedStock={selectedStockForConfig}
        setSelectedStock={setSelectedStockForConfig}
        onSave={(e) => {
          e.preventDefault();
          setInventoryStock(prev => prev.map(s => s.code === selectedStockForConfig.code ? selectedStockForConfig : s));
          setShowInchargeConfigModal(false);
        }}
      />

    </div>
  );
}
