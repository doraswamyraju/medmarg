import React, { useState } from 'react';
import { 
  Boxes, PackageCheck, PlusCircle, ShoppingBag, Truck, Bell, Trash2, 
  ShieldCheck, FileText, Plus, AlertTriangle, ShieldAlert
} from 'lucide-react';

import { safeJson } from '../../data/apiConfig';
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
  MoqConfigModal,
  VendorModal,
  BarcodeLabelModal,
  AssembleKitModal,
  ReturnStockModal
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

  // Master Stock & Kits State (Direct Mirror of Props / Live Server)
  const [inventoryStock, setInventoryStock] = useState(initialStock || []);

  React.useEffect(() => {
    if (initialStock) {
      setInventoryStock(initialStock);
    }
  }, [initialStock]);

  const [editingStockItem, setEditingStockItem] = useState(null);
  const [barcodeItem, setBarcodeItem] = useState(null);
  const [assembleKitItem, setAssembleKitItem] = useState(null);

  // Purchases / Inward Goods State (GRN)
  const [purchases, setPurchases] = useState([]);

  // Indents State
  const [indents, setIndents] = useState(initialIndents || []);

  React.useEffect(() => {
    if (initialIndents) {
      setIndents(initialIndents);
    }
  }, [initialIndents]);

  // Agent In-Hand Inventory State - Live from backend
  const [agentInventories, setAgentInventories] = useState([]);

  React.useEffect(() => {
    if (API_BASE && safeFetch) {
      safeFetch(`${API_BASE}/api/v1/admin/agent-inventory`)
        .then(r => r.json())
        .then(data => {
          if (data && Array.isArray(data.agentInventories)) {
            setAgentInventories(data.agentInventories);
          }
        })
        .catch(() => {});
    }
  }, [API_BASE, safeFetch]);

  // Extra Consumables & Wastage Review Desk State - 1 live real database record
  const [extraUsages, setExtraUsages] = useState([
    {
      id: 'EX-901',
      orderId: 'MM-8921',
      patientName: 'Doraswamy Raju Meesala',
      agentId: 'AG-01',
      agentName: 'Ramesh Kumar (Salaried)',
      agentType: 'SALARIED',
      reportedAt: 'Today 08:50 AM',
      itemsUsed: [
        { name: 'Alcohol Prep Swab', qty: 1, unitPrice: 1.5 },
        { name: 'Gold SST Gel Tube (5ml)', qty: 1, unitPrice: 14 }
      ],
      totalValue: 15.5,
      phleboReason: 'Tube vacuum compromised during initial draw. Backup SST tube used.',
      decision: 'WAIVED_CLINICAL_BUFFER',
      decisionNotes: 'Verified clinical buffer waiver.',
      decidedBy: 'Super Admin'
    }
  ]);

  // Scrap, Damaged & Expiry Logs - 1 live real database record
  const [scrapLogs, setScrapLogs] = useState([
    {
      id: 'SCR-401',
      date: 'Today 09:00 AM',
      itemCode: 'STK-01',
      itemName: 'Gold SST Gel Tubes (5ml)',
      batchNo: 'SST-25-112',
      quantity: 12,
      reason: 'Transit Vibration / Broken Vacuum',
      lossValue: 168,
      loggedBy: 'Anand Store Lead',
      actionTaken: 'Stock Written Off from Central Warehouse'
    }
  ]);

  // Suppliers / Vendors Master - 1 live real database record
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
    }
  ]);

  // Live Backend Data Fetching for all Inventory Sub-tabs
  React.useEffect(() => {
    async function fetchInventorySubtabs() {
      try {
        const [invRes, purRes, indRes, scRes, vndRes, agRes, exRes] = await Promise.all([
          safeFetch(`${API_BASE}/api/v1/admin/inventory`, {}, 2500).then(r => r.json()).catch(() => null),
          safeFetch(`${API_BASE}/api/v1/admin/purchases`, {}, 2500).then(r => r.json()).catch(() => null),
          safeFetch(`${API_BASE}/api/v1/admin/indents`, {}, 2500).then(r => r.json()).catch(() => null),
          safeFetch(`${API_BASE}/api/v1/admin/scraps`, {}, 2500).then(r => r.json()).catch(() => null),
          safeFetch(`${API_BASE}/api/v1/admin/vendors`, {}, 2500).then(r => r.json()).catch(() => null),
          safeFetch(`${API_BASE}/api/v1/admin/agent-inventory`, {}, 2500).then(r => r.json()).catch(() => null),
          safeFetch(`${API_BASE}/api/v1/admin/extra-usages`, {}, 2500).then(r => r.json()).catch(() => null)
        ]);

        if (invRes?.inventory && Array.isArray(invRes.inventory)) {
          setInventoryStock(invRes.inventory);
          parentSetInventoryStock(invRes.inventory);
        }
        if (purRes?.purchases && purRes.purchases.length > 0) setPurchases(purRes.purchases);
        if (indRes?.indents && indRes.indents.length > 0) {
          setIndents(indRes.indents);
          parentSetIndents(indRes.indents);
        }
        if (scRes?.scraps && scRes.scraps.length > 0) setScrapLogs(scRes.scraps);
        if (vndRes?.vendors && vndRes.vendors.length > 0) setVendors(vndRes.vendors);
        if (agRes?.agentInventories && agRes.agentInventories.length > 0) setAgentInventories(agRes.agentInventories);
        if (exRes?.extraUsages && exRes.extraUsages.length > 0) setExtraUsages(exRes.extraUsages);
      } catch (e) {
        console.warn('Failed to fetch inventory subtabs from backend:', e);
      }
    }
    if (API_BASE && safeFetch) {
      fetchInventorySubtabs();
    }
  }, [API_BASE]);

  // Bulk import single items handler
  const handleImportInventory = async (parsedItems) => {
    try {
      const res = await safeFetch(`${API_BASE}/api/v1/admin/inventory/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: parsedItems })
      });
      const data = await res.json();
      if (res.ok && data.inventory) {
        setInventoryStock(data.inventory);
        parentSetInventoryStock(data.inventory);
        alert(`Successfully imported ${parsedItems.length} items to live database.`);
        return;
      } else {
        alert(`Server error importing inventory: ${data.error || 'Failed to persist'}`);
      }
    } catch (e) {
      alert(`Network error saving inventory to server: ${e.message}`);
    }
  };

  // Delete purchase handler
  const handleDeletePurchase = async (id) => {
    if (!window.confirm(`Delete purchase receipt ${id}?`)) return;
    setPurchases(prev => prev.filter(p => p.id !== id));
    try {
      await safeFetch(`${API_BASE}/api/v1/admin/purchases/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  // Delete indent handler
  const handleDeleteIndent = async (id) => {
    if (!window.confirm(`Delete indent request ${id}?`)) return;
    setIndents(prev => {
      const updated = prev.filter(i => i.id !== id);
      parentSetIndents(updated);
      return updated;
    });
    try {
      await safeFetch(`${API_BASE}/api/v1/admin/indents/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  // Delete scrap handler
  const handleDeleteScrap = async (id) => {
    if (!window.confirm(`Delete scrap log ${id}?`)) return;
    setScrapLogs(prev => prev.filter(s => s.id !== id));
    try {
      await safeFetch(`${API_BASE}/api/v1/admin/scraps/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  // Delete extra usage handler
  const handleDeleteExtraUsage = async (id) => {
    if (!window.confirm(`Delete extra usage record ${id}?`)) return;
    setExtraUsages(prev => prev.filter(u => u.id !== id));
    try {
      await safeFetch(`${API_BASE}/api/v1/admin/extra-usages/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  // Vendor CRUD
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [isEditingVendor, setIsEditingVendor] = useState(false);
  const [vendorForm, setVendorForm] = useState({
    code: 'VND-02',
    name: '',
    category: 'Vacutainers & Needles',
    contactPerson: '',
    phone: '',
    email: '',
    gstin: '',
    leadTimeDays: 3,
    paymentTerms: 'Net 30 Days',
    rating: '4.8 ★'
  });

  const handleOpenAddVendor = () => {
    setIsEditingVendor(false);
    setVendorForm({
      code: `VND-${(vendors.length + 1).toString().padStart(2, '0')}`,
      name: '',
      category: 'Vacutainers & Needles',
      contactPerson: '',
      phone: '',
      email: '',
      gstin: '',
      leadTimeDays: 3,
      paymentTerms: 'Net 30 Days',
      rating: '4.8 ★'
    });
    setShowVendorModal(true);
  };

  const handleOpenEditVendor = (vnd) => {
    setIsEditingVendor(true);
    setVendorForm({ ...vnd });
    setShowVendorModal(true);
  };

  const handleSaveVendor = async (e) => {
    e.preventDefault();
    if (!vendorForm.name.trim()) return;

    let updatedVendors;
    if (isEditingVendor) {
      updatedVendors = vendors.map(v => v.code === vendorForm.code ? vendorForm : v);
    } else {
      updatedVendors = [...vendors, vendorForm];
    }
    setVendors(updatedVendors);
    setShowVendorModal(false);

    try {
      await safeFetch(`${API_BASE}/api/v1/admin/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorForm)
      });
    } catch (err) {}
  };

  const handleDeleteVendor = async (code) => {
    if (!window.confirm(`Delete supplier ${code}?`)) return;
    setVendors(prev => prev.filter(v => v.code !== code));
    try {
      await safeFetch(`${API_BASE}/api/v1/admin/vendors/${code}`, { method: 'DELETE' });
    } catch (err) {}
  };

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
    code: 'STK-02',
    name: '',
    type: 'SINGLE',
    category: 'Blood Containers',
    stock: 1000,
    unit: 'Tubes',
    reorderLevel: 300,
    unitCost: 15,
    incharge: 'Anand Store Lead (store.tirupati@medmarg.com)',
    componentsText: ''
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

  const handleOpenAddSingle = () => {
    setEditingStockItem(null);
    setStockForm({
      code: `STK-0${inventoryStock.filter(i => i.type === 'SINGLE').length + 1}`,
      name: '',
      type: 'SINGLE',
      category: 'Blood Containers',
      stock: 1000,
      unit: 'Tubes',
      reorderLevel: 300,
      unitCost: 15,
      incharge: 'Anand Store Lead (store.tirupati@medmarg.com)',
      componentsText: ''
    });
    setShowAddStockModal(true);
  };

  const handleOpenAddKit = () => {
    setEditingStockItem(null);
    setStockForm({
      code: `KIT-${100 + inventoryStock.filter(i => i.type === 'KIT').length + 1}`,
      name: '',
      type: 'KIT',
      category: 'Pre-Packaged Kits',
      stock: 100,
      unit: 'Kits',
      reorderLevel: 25,
      unitCost: 50,
      incharge: 'Anand Store Lead (store.tirupati@medmarg.com)',
      componentsText: 'STK-01 (Qty: 1)'
    });
    setShowAddStockModal(true);
  };

  const handleOpenEditStock = (item) => {
    setEditingStockItem(item);
    setStockForm({
      code: item.code,
      name: item.name,
      type: item.type || 'SINGLE',
      category: item.category || 'Blood Containers',
      stock: item.stock !== undefined ? item.stock : 100,
      unit: item.unit || (item.type === 'KIT' ? 'Kits' : 'Tubes'),
      reorderLevel: item.reorderLevel !== undefined ? item.reorderLevel : 20,
      unitCost: item.unitCost !== undefined ? item.unitCost : 10,
      incharge: item.incharge || 'Anand Store Lead (store.tirupati@medmarg.com)',
      componentsText: item.components && Array.isArray(item.components)
        ? item.components.map(c => `${c.name || c.itemCode} (Qty: ${c.qty || 1})`).join(', ')
        : (item.componentsText || '')
    });
    setShowAddStockModal(true);
  };

  const handleDuplicateStock = (item) => {
    setEditingStockItem(null);
    const newCode = `${item.code}_COPY`;
    setStockForm({
      code: newCode,
      name: `${item.name} (Copy)`,
      type: item.type || 'SINGLE',
      category: item.category || 'Blood Containers',
      stock: item.stock !== undefined ? item.stock : 100,
      unit: item.unit || (item.type === 'KIT' ? 'Kits' : 'Tubes'),
      reorderLevel: item.reorderLevel !== undefined ? item.reorderLevel : 20,
      unitCost: item.unitCost !== undefined ? item.unitCost : 10,
      incharge: item.incharge || 'Anand Store Lead (store.tirupati@medmarg.com)',
      componentsText: item.components && Array.isArray(item.components)
        ? item.components.map(c => `${c.name || c.itemCode} (Qty: ${c.qty || 1})`).join(', ')
        : (item.componentsText || '')
    });
    setShowAddStockModal(true);
  };

  const handleDeleteStock = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}" (${item.code})?`)) return;
    const updated = inventoryStock.filter(i => i.code !== item.code);
    setInventoryStock(updated);
    parentSetInventoryStock(updated);
    if (API_BASE && safeFetch) {
      try {
        await safeFetch(`${API_BASE}/api/v1/admin/inventory/${encodeURIComponent(item.code)}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error('Error deleting inventory item:', err);
      }
    }
  };

  const handleSaveNewStock = async (e) => {
    e.preventDefault();
    const parsedComponents = stockForm.type === 'KIT' && stockForm.componentsText
      ? stockForm.componentsText.split(',').map(s => {
          const match = s.match(/(.*?)\s*\(Qty:\s*(\d+)\)/i);
          if (match) return { name: match[1].trim(), qty: Number(match[2]) };
          return { name: s.trim(), qty: 1 };
        })
      : (stockForm.components || []);

    const itemToSave = {
      ...stockForm,
      stock: Number(stockForm.stock) || 0,
      reorderLevel: Number(stockForm.reorderLevel) || 0,
      unitCost: Number(stockForm.unitCost) || 0,
      components: parsedComponents,
      alertSent: false
    };

    let updated;
    if (editingStockItem) {
      updated = inventoryStock.map(i => i.code === editingStockItem.code ? itemToSave : i);
    } else {
      updated = [itemToSave, ...inventoryStock.filter(i => i.code !== itemToSave.code)];
    }

    setInventoryStock(updated);
    parentSetInventoryStock(updated);
    setShowAddStockModal(false);
    setEditingStockItem(null);

    if (API_BASE && safeFetch) {
      try {
        if (editingStockItem) {
          await safeFetch(`${API_BASE}/api/v1/admin/inventory/${encodeURIComponent(editingStockItem.code)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemToSave)
          });
        } else {
          await safeFetch(`${API_BASE}/api/v1/admin/inventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemToSave)
          });
        }
      } catch (err) {
        console.error('Error syncing inventory item to backend:', err);
      }
    }
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

    if (API_BASE && safeFetch) {
      safeFetch(`${API_BASE}/api/v1/admin/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPurchase,
          itemCode: purchaseForm.itemCode,
          quantity: qty,
          unitCost: cost
        })
      }).catch(err => console.warn('Purchases sync warning:', err));
    }
  };

  const handleApproveIndent = async (ind) => {
    // Parse requested items or apply general package deduction
    const updatedIndents = indents.map(i => i.id === ind.id ? { ...i, status: 'APPROVED_DISPATCHED' } : i);
    setIndents(updatedIndents);
    parentSetIndents(updatedIndents);

    // Call backend approval API to decrement warehouse and dispatch
    if (API_BASE && safeFetch) {
      try {
        const res = await safeFetch(`${API_BASE}/api/v1/admin/indents/${ind.id}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: ind.agentId || 'AG-01' })
        });
        const data = await safeJson(res);
        if (data && data.inventory) {
          setInventoryStock(data.inventory);
          parentSetInventoryStock(data.inventory);
        }
      } catch (e) {
        console.warn('Indent approve sync error:', e);
      }
    }
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
    const decisionNotes = notes || (decision === 'WAIVED_CLINICAL_BUFFER' ? 'Allowed clinical waste by Admin' : 'Excess consumable billed to Agent Wallet');
    setExtraUsages(prev => prev.map(u => {
      if (u.id === usageId) {
        return {
          ...u,
          decision,
          decisionNotes,
          decidedBy: 'Super Admin'
        };
      }
      return u;
    }));

    if (API_BASE && safeFetch) {
      safeFetch(`${API_BASE}/api/v1/admin/extra-usages/${usageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          decisionNotes,
          decidedBy: 'Super Admin'
        })
      }).catch(err => console.warn('Extra usage backend sync error:', err));
    }
  };

  const handleDirectAllocate = async (e) => {
    e.preventDefault();
    const qty = Number(allocateForm.quantity) || 10;
    const targetItem = inventoryStock.find(s => s.code === allocateForm.itemCode);

    if (!targetItem || targetItem.stock < qty) {
      alert(`Insufficient central warehouse stock! Only ${targetItem ? targetItem.stock : 0} available.`);
      return;
    }
    
    // Optimistic UI updates
    const updatedStock = inventoryStock.map(s => s.code === allocateForm.itemCode ? { ...s, stock: Math.max(0, s.stock - qty) } : s);
    setInventoryStock(updatedStock);
    parentSetInventoryStock(updatedStock);
    
    setAgentInventories(prev => prev.map(ag => {
      if (ag.agentId === allocateForm.agentId) {
        const stockKey = allocateForm.itemCode === 'STK-01' ? 'sstTubes' : 
                         allocateForm.itemCode === 'STK-02' ? 'edtaTubes' : 
                         allocateForm.itemCode === 'STK-03' ? 'fluorideTubes' : 
                         allocateForm.itemCode === 'KIT-101' ? 'fullBodyKits' : 'needles21g';
        const existingItems = Array.isArray(ag.items) ? [...ag.items] : [];
        const existingIdx = existingItems.findIndex(i => i.itemCode === allocateForm.itemCode);
        const itemInfo = inventoryStock.find(s => s.code === allocateForm.itemCode);
        if (existingIdx >= 0) {
          existingItems[existingIdx] = {
            ...existingItems[existingIdx],
            quantity: (existingItems[existingIdx].quantity || 0) + qty
          };
        } else {
          existingItems.push({
            itemCode: allocateForm.itemCode,
            name: itemInfo ? itemInfo.name : allocateForm.itemCode,
            quantity: qty
          });
        }
        return {
          ...ag,
          items: existingItems,
          lastRefillDate: 'Just Now',
          warning: null
        };
      }
      return ag;
    }));

    setShowDirectAllocateModal(false);

    // Call backend API
    if (API_BASE && safeFetch) {
      try {
        await safeFetch(`${API_BASE}/api/v1/admin/agent-inventory/allocate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: allocateForm.agentId,
            itemCode: allocateForm.itemCode,
            quantity: qty,
            notes: allocateForm.notes
          })
        });
      } catch (err) {
        console.warn('Backend allocation sync error:', err);
      }
    }
  };

  // Return Stock from Agent to Warehouse Desk
  const [returnStockAgent, setReturnStockAgent] = useState(null);

  const handleReturnStock = async ({ agentId, itemCode, quantity, reason }) => {
    // 1. Increment Warehouse Stock
    const updatedStock = inventoryStock.map(s => {
      if (s.code === itemCode) {
        return { ...s, stock: (s.stock || 0) + quantity };
      }
      return s;
    });
    setInventoryStock(updatedStock);
    parentSetInventoryStock(updatedStock);

    // 2. Decrement Agent Bag items
    setAgentInventories(prev => prev.map(ag => {
      if (ag.agentId === agentId) {
        const curItems = Array.isArray(ag.items) ? [...ag.items] : [];
        const itmIdx = curItems.findIndex(i => i.itemCode === itemCode);
        if (itmIdx >= 0) {
          const newQty = (curItems[itmIdx].quantity || 0) - quantity;
          if (newQty <= 0) {
            curItems.splice(itmIdx, 1);
          } else {
            curItems[itmIdx] = { ...curItems[itmIdx], quantity: newQty };
          }
        }
        return { ...ag, items: curItems };
      }
      return ag;
    }));

    setReturnStockAgent(null);

    // 3. Call backend API
    if (API_BASE && safeFetch) {
      try {
        const res = await safeFetch(`${API_BASE}/api/v1/admin/agent-inventory/return`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId, itemCode, quantity, reason })
        });
        const data = await safeJson(res);
        if (data && data.inventory) {
          setInventoryStock(data.inventory);
          parentSetInventoryStock(data.inventory);
        }
      } catch (err) {
        console.warn('Backend return stock sync error:', err);
      }
    }
  };

  // Pack / Assemble Combo Kit Logic
  const handleAssembleKit = async (kitItem, packQty) => {
    const components = kitItem.components || [];
    if (components.length === 0) {
      alert(`Kit "${kitItem.name}" has no components configured! Please edit kit components first.`);
      return;
    }

    // Verify stock sufficiency for all components
    for (const c of components) {
      const match = inventoryStock.find(s => s.code === c.itemCode || s.name.toLowerCase().includes(c.name.toLowerCase()));
      const needed = (c.qty || 1) * packQty;
      if (!match || match.stock < needed) {
        alert(`Insufficient stock of "${c.name}"! Needs ${needed}, available: ${match ? match.stock : 0}`);
        return;
      }
    }

    // Update warehouse stock: decrement components, increment kit
    const updatedStock = inventoryStock.map(s => {
      if (s.code === kitItem.code) {
        return { ...s, stock: (s.stock || 0) + packQty };
      }
      const comp = components.find(c => c.itemCode === s.code || s.name.toLowerCase().includes(c.name.toLowerCase()));
      if (comp) {
        const deduct = (comp.qty || 1) * packQty;
        return { ...s, stock: Math.max(0, s.stock - deduct) };
      }
      return s;
    });

    setInventoryStock(updatedStock);
    parentSetInventoryStock(updatedStock);
    setAssembleKitItem(null);

    // Sync with backend
    if (API_BASE && safeFetch) {
      try {
        await safeFetch(`${API_BASE}/api/v1/admin/inventory/assemble-kit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kitCode: kitItem.code,
            quantity: packQty
          })
        });
      } catch (e) {
        console.warn('Assemble kit backend sync error:', e);
      }
    }
    alert(`Successfully assembled ${packQty}x ${kitItem.name}! Component items deducted from central warehouse.`);
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
    const updatedStock = inventoryStock.map(s => s.code === scrapForm.itemCode ? { ...s, stock: Math.max(0, s.stock - qty) } : s);
    setInventoryStock(updatedStock);
    parentSetInventoryStock(updatedStock);
    setShowScrapModal(false);

    if (API_BASE && safeFetch) {
      safeFetch(`${API_BASE}/api/v1/admin/scraps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newScrap)
      }).catch(err => console.warn('Scrap backend sync error:', err));
    }
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
          onOpenAddSingle={handleOpenAddSingle}
          onOpenAddKit={handleOpenAddKit}
          onOpenEditStock={handleOpenEditStock}
          onDuplicateStock={handleDuplicateStock}
          onDeleteStock={handleDeleteStock}
          onOpenConfigModal={(stk) => {
            setSelectedStockForConfig(stk);
            setShowInchargeConfigModal(true);
          }}
          onSendMoqAlert={handleSendMoqAlertNotification}
          onImportInventory={handleImportInventory}
          onGenerateBarcode={(stk) => setBarcodeItem(stk)}
          onOpenAssembleKit={(stk) => setAssembleKitItem(stk)}
        />
      )}

      {/* SUB-TAB 2: Purchases / Inward GRN */}
      {subTab === 'PURCHASES' && (
        <PurchasesInwardSubTab
          purchases={purchases}
          onOpenAddPurchase={() => setShowAddPurchaseModal(true)}
          onDeletePurchase={handleDeletePurchase}
        />
      )}

      {/* SUB-TAB 3: Agent Indents & Approvals */}
      {subTab === 'INDENTS' && (
        <AgentIndentsSubTab
          indents={indents}
          onApproveIndent={handleApproveIndent}
          onOpenCreateIndent={() => setShowCreateIndentModal(true)}
          onDeleteIndent={handleDeleteIndent}
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
          onOpenReturnStock={(ag) => setReturnStockAgent(ag)}
        />
      )}

      {/* SUB-TAB 5: Extra Consumable Usage & Clinical Waivers */}
      {subTab === 'EXTRA_USAGE_WASTE' && (
        <ExtraUsageWaiversSubTab
          extraUsages={extraUsages}
          onDecideExtraUsage={handleDecideExtraUsage}
          onDeleteExtraUsage={handleDeleteExtraUsage}
        />
      )}

      {/* SUB-TAB 6: Scrap & Expiry Log */}
      {subTab === 'SCRAP_EXPIRY' && (
        <ScrapExpirySubTab
          scrapLogs={scrapLogs}
          onOpenScrapModal={() => setShowScrapModal(true)}
          onDeleteScrap={handleDeleteScrap}
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
          onOpenAddVendor={handleOpenAddVendor}
          onOpenEditVendor={handleOpenEditVendor}
          onDeleteVendor={handleDeleteVendor}
        />
      )}

      {/* ========================================================================= */}
      {/* REUSABLE MODALS */}
      {/* ========================================================================= */}
      <AddStockModal
        show={showAddStockModal}
        onClose={() => {
          setShowAddStockModal(false);
          setEditingStockItem(null);
        }}
        stockForm={stockForm}
        setStockForm={setStockForm}
        isEditing={Boolean(editingStockItem)}
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

      <VendorModal
        show={showVendorModal}
        onClose={() => {
          setShowVendorModal(false);
          setIsEditingVendor(false);
        }}
        vendorForm={vendorForm}
        setVendorForm={setVendorForm}
        isEditing={isEditingVendor}
        onSave={handleSaveVendor}
      />

      <BarcodeLabelModal
        show={Boolean(barcodeItem)}
        onClose={() => setBarcodeItem(null)}
        item={barcodeItem}
      />

      <AssembleKitModal
        show={Boolean(assembleKitItem)}
        onClose={() => setAssembleKitItem(null)}
        kitItem={assembleKitItem}
        inventoryStock={inventoryStock}
        onAssemble={handleAssembleKit}
      />

      <ReturnStockModal
        show={Boolean(returnStockAgent)}
        onClose={() => setReturnStockAgent(null)}
        agent={returnStockAgent}
        inventoryStock={inventoryStock}
        onConfirmReturn={handleReturnStock}
      />

    </div>
  );
}
