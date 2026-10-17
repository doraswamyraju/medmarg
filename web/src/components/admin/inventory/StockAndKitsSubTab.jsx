import React, { useState } from 'react';
import { 
  Search, 
  Boxes, 
  Layers, 
  AlertTriangle, 
  Bell, 
  PlusCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy,
  Package,
  Download,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import { 
  downloadInventorySampleTemplate, 
  exportInventoryToExcel, 
  parseInventoryFromExcel 
} from '../../../utils/excelCatalogHelper';

export default function StockAndKitsSubTab({
  inventoryStock = [],
  onOpenAddSingle = () => {},
  onOpenAddKit = () => {},
  onOpenEditStock = () => {},
  onDuplicateStock = () => {},
  onDeleteStock = () => {},
  onOpenConfigModal = () => {},
  onSendMoqAlert = () => {},
  onImportInventory = async () => {}
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [itemTypeFilter, setItemTypeFilter] = useState('ALL');
  const [isImporting, setIsImporting] = useState(false);
  const [importNotice, setImportNotice] = useState(null);

  const handleInventoryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setImportNotice({ type: 'info', message: 'Reading and validating inventory Excel sheet...' });
    try {
      const parsedItems = await parseInventoryFromExcel(file);
      if (!parsedItems || parsedItems.length === 0) {
        throw new Error('No valid inventory rows detected in the uploaded file.');
      }
      await onImportInventory(parsedItems);
      setImportNotice({ type: 'success', message: `Successfully imported ${parsedItems.length} single inventory items to database!` });
      setTimeout(() => setImportNotice(null), 5000);
    } catch (err) {
      console.error('Inventory Excel error:', err);
      setImportNotice({ type: 'error', message: `Import Failed: ${err.message || 'Invalid format'}` });
      setTimeout(() => setImportNotice(null), 6000);
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const filteredStock = inventoryStock.filter(stk => {
    const matchSearch = stk.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        stk.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || stk.category === categoryFilter;
    const matchType = itemTypeFilter === 'ALL' || stk.type === itemTypeFilter;
    return matchSearch && matchCat && matchType;
  });

  return (
    <div>
      {/* Search & Action Bar */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by SKU, tube type, needle size, kit name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.55rem 0.85rem 0.55rem 2.4rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
            />
          </div>

          <select
            value={itemTypeFilter}
            onChange={(e) => setItemTypeFilter(e.target.value)}
            style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFF', fontWeight: '700', color: '#0F172A' }}
          >
            <option value="ALL">All Types (Single & Kits)</option>
            <option value="SINGLE">Single Consumables Only</option>
            <option value="KIT">Combo Kits Only</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFF', fontWeight: '700', color: '#0F172A' }}
          >
            <option value="ALL">All Categories</option>
            <option value="Blood Containers">Blood Containers (Vacutainers)</option>
            <option value="Phlebotomy Supplies">Phlebotomy Supplies & Needles</option>
            <option value="Cold Chain Equipment">Cold Chain Equipment</option>
            <option value="Pre-Packaged Kits">Pre-Packaged Kits</option>
            <option value="Disinfectants & Swabs">Disinfectants & Swabs</option>
            <option value="Waste Management">Waste Management (Biohazard)</option>
            <option value="Barcodes & Stationery">Barcodes & Stationery</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={downloadInventorySampleTemplate}
            title="Download Sample Format Excel Template for Inventory"
            style={{ padding: '0.55rem 0.9rem', backgroundColor: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <FileSpreadsheet size={14} color="#059669" /> Sample Format
          </button>

          <label
            title="Import Single Items Inventory from Excel / CSV"
            style={{ padding: '0.55rem 0.9rem', backgroundColor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem', cursor: isImporting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Upload size={14} /> {isImporting ? 'Importing...' : 'Import Single Items'}
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleInventoryUpload}
              disabled={isImporting}
              style={{ display: 'none' }}
            />
          </label>

          <button
            onClick={() => exportInventoryToExcel(inventoryStock)}
            title="Export Current Single Items Inventory to Excel"
            style={{ padding: '0.55rem 0.9rem', backgroundColor: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD', borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Download size={14} /> Export Single Items
          </button>

          <button
            onClick={onOpenAddSingle}
            style={{ padding: '0.55rem 1rem', backgroundColor: '#006B70', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 4px 12px rgba(0,107,112,0.2)' }}
          >
            <PlusCircle size={15} /> + Add Single Item
          </button>
          <button
            onClick={onOpenAddKit}
            style={{ padding: '0.55rem 1rem', backgroundColor: '#4F46E5', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 4px 12px rgba(79,70,229,0.2)' }}
          >
            <Layers size={15} /> + Create Combo Kit
          </button>
        </div>
      </div>

      {importNotice && (
        <div style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1rem',
          borderRadius: '12px',
          backgroundColor: importNotice.type === 'error' ? '#FEE2E2' : importNotice.type === 'success' ? '#DCFCE7' : '#E0F2FE',
          color: importNotice.type === 'error' ? '#991B1B' : importNotice.type === 'success' ? '#15803D' : '#075985',
          fontSize: '0.85rem',
          fontWeight: '800',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <span>{importNotice.message}</span>
          <button 
            onClick={() => setImportNotice(null)} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '900', fontSize: '1.1rem', color: 'inherit' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Tabular Format for Inventory Stock & Kits */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
              <th style={{ padding: '1rem 1.25rem', width: '15%' }}>SKU / CODE</th>
              <th style={{ padding: '1rem', width: '28%' }}>ITEM / KIT SPECIFICATION</th>
              <th style={{ padding: '1rem', width: '18%' }}>CURRENT STOCK</th>
              <th style={{ padding: '1rem', width: '12%' }}>MOQ LEVEL</th>
              <th style={{ padding: '1rem', width: '11%' }}>EST. COST</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right', width: '16%' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredStock.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                  No inventory items match your search. Click "+ Add Single Item" or "+ Create Combo Kit" to register stock.
                </td>
              </tr>
            ) : (
              filteredStock.map(stk => {
                const isLowStock = stk.stock <= stk.reorderLevel;
                const isKit = stk.type === 'KIT';

                return (
                  <tr key={stk.code} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    {/* SKU / Code */}
                    <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.82rem', color: '#006B70', fontWeight: '900', fontFamily: 'monospace', backgroundColor: '#F0FDFA', padding: '0.15rem 0.5rem', borderRadius: '6px', width: 'fit-content' }}>
                          {stk.code}
                        </span>
                        {isKit ? (
                          <span style={{ fontSize: '0.7rem', backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: '800', padding: '0.12rem 0.45rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem', width: 'fit-content' }}>
                            <Layers size={11} /> COMBO KIT
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', backgroundColor: '#F1F5F9', color: '#475569', fontWeight: '800', padding: '0.12rem 0.45rem', borderRadius: '4px', width: 'fit-content' }}>
                            SINGLE ITEM
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Name & Specification */}
                    <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.92rem' }}>
                        {stk.name}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.15rem' }}>
                        {stk.category} • <span style={{ color: '#004D40' }}>{stk.incharge}</span>
                      </div>

                      {/* Kit Components Chip Breakdown */}
                      {isKit && stk.components && stk.components.length > 0 && (
                        <div style={{ marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {stk.components.map((c, idx) => (
                            <span 
                              key={idx} 
                              style={{ fontSize: '0.72rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                            >
                              <strong style={{ color: '#006B70' }}>{c.qty}x</strong> {c.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Stock Count */}
                    <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '900', color: isLowStock ? '#D97706' : '#059669' }}>
                          {stk.stock.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>
                          {stk.unit || (isKit ? 'Kits' : 'Units')}
                        </span>
                      </div>
                      <div style={{ marginTop: '0.2rem' }}>
                        {isLowStock ? (
                          <span style={{ fontSize: '0.68rem', color: '#B45309', fontWeight: '800', backgroundColor: '#FEF3C7', padding: '0.12rem 0.45rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <AlertTriangle size={11} /> BELOW MOQ
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.68rem', color: '#15803D', fontWeight: '800', backgroundColor: '#DCFCE7', padding: '0.12rem 0.45rem', borderRadius: '4px' }}>
                            IN STOCK
                          </span>
                        )}
                      </div>
                    </td>

                    {/* MOQ */}
                    <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A' }}>
                        {stk.reorderLevel.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{stk.unit}</div>
                    </td>

                    {/* Est. Cost */}
                    <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#006B70' }}>
                        ₹{stk.unitCost || 0}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>per {stk.unit?.slice(0, -1) || 'unit'}</div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button
                          title="Duplicate Item / Kit"
                          onClick={() => onDuplicateStock(stk)}
                          style={{ padding: '0.4rem 0.65rem', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#006B70', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '800', fontSize: '0.76rem' }}
                        >
                          <Copy size={13} /> Duplicate
                        </button>
                        <button
                          title="Edit Inventory Item"
                          onClick={() => onOpenEditStock(stk)}
                          style={{ padding: '0.4rem 0.65rem', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0284C7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '800', fontSize: '0.76rem' }}
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                        <button
                          title="Delete Inventory SKU"
                          onClick={() => onDeleteStock(stk)}
                          style={{ padding: '0.4rem 0.55rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
