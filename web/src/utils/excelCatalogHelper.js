import * as XLSX from 'xlsx';

/**
 * Excel & CSV Import/Export Helper for MedMarg Tests & Inventory
 */

// ============================================================================
// 1. SINGLE TESTS MASTER EXCEL TEMPLATE & EXPORT/IMPORT
// ============================================================================

export const TEST_EXCEL_COLUMNS = [
  { header: 'Test Code *', key: 'code', example: 'CBC' },
  { header: 'Test Name *', key: 'name', example: 'Complete Blood Count (CBC) with ESR' },
  { header: 'Alias Names (Comma-separated)', key: 'aliasNames', example: 'Complete Hemogram, CBC Test, Full Blood Count, FBC' },
  { header: 'Sample Specimen *', key: 'sampleType', example: 'EDTA WHOLE BLOOD' },
  { header: 'Fasting Required (YES/NO) *', key: 'fasting', example: 'NO' },
  { header: 'Turnaround Time (Hours)', key: 'tatHours', example: 12 },
  { header: 'Standard Market MRP (₹) *', key: 'mrp', example: 450 },
  { header: 'Base Offer Price (₹) *', key: 'price', example: 299 },
  { header: 'MedMarg Lab Rate (₹)', key: 'medmargPrice', example: 299 },
  { header: 'Thyrocare Lab Rate (₹)', key: 'thyrocarePrice', example: 339 },
  { header: 'Dr Lal Lab Rate (₹)', key: 'lalpathPrice', example: 389 },
  { header: '1 Person Slab (₹)', key: 'slab1P', example: 299 },
  { header: '2 People Slab (₹/person)', key: 'slab2P', example: 249 },
  { header: '5 People Slab (₹/person)', key: 'slab5P', example: 209 },
  { header: '10+ People Slab (₹/person)', key: 'slab10P', example: 159 },
  { header: 'Clinical Description', key: 'description', example: 'Complete hemogram evaluating Red Blood Cells, White Blood Cells, Platelets, Hemoglobin, Hematocrit and ESR.' }
];

export function downloadTestSampleTemplate() {
  const sampleRow = {};
  TEST_EXCEL_COLUMNS.forEach(col => {
    sampleRow[col.header] = col.example;
  });

  const ws = XLSX.utils.json_to_sheet([sampleRow]);
  ws['!cols'] = TEST_EXCEL_COLUMNS.map(col => ({ wch: Math.max(col.header.length, String(col.example).length) + 4 }));
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Single_Tests_Template');
  XLSX.writeFile(wb, 'MedMarg_Single_Tests_Format_Sample.xlsx');
}

export function exportTestsToExcel(tests = []) {
  const rows = tests.map(test => {
    const labs = test.labPricing || [];
    const tiers = test.tierPricing || {};
    const medmarg = labs.find(l => l.isMedmargSuggested || l.labId === 'medmarg') || labs[0];
    const thyrocare = labs.find(l => l.labId === 'thyrocare') || labs[1];
    const lalpath = labs.find(l => l.labId === 'lalpath') || labs[2];

    const aliases = Array.isArray(test.aliasNames) 
      ? test.aliasNames.join(', ') 
      : (test.aliasNames || '');

    return {
      'Test Code *': test.code || '',
      'Test Name *': test.name || '',
      'Alias Names (Comma-separated)': aliases,
      'Sample Specimen *': test.sampleType || 'SERUM',
      'Fasting Required (YES/NO) *': test.fasting || 'NO',
      'Turnaround Time (Hours)': test.tatHours || 24,
      'Standard Market MRP (₹) *': test.mrp || 499,
      'Base Offer Price (₹) *': test.price || 299,
      'MedMarg Lab Rate (₹)': medmarg?.price ?? test.price ?? 299,
      'Thyrocare Lab Rate (₹)': thyrocare?.price ?? Math.round((test.price || 299) * 1.15),
      'Dr Lal Lab Rate (₹)': lalpath?.price ?? Math.round((test.price || 299) * 1.3),
      '1 Person Slab (₹)': tiers['1']?.offerPrice ?? tiers['1']?.pricePerPerson ?? test.price ?? 299,
      '2 People Slab (₹/person)': tiers['2']?.offerPrice ?? tiers['2']?.pricePerPerson ?? Math.round((test.price || 299) * 0.85),
      '5 People Slab (₹/person)': tiers['5']?.offerPrice ?? tiers['5']?.pricePerPerson ?? Math.round((test.price || 299) * 0.7),
      '10+ People Slab (₹/person)': tiers['10']?.offerPrice ?? tiers['10']?.pricePerPerson ?? Math.round((test.price || 299) * 0.55),
      'Clinical Description': test.description || ''
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{}]);
  ws['!cols'] = TEST_EXCEL_COLUMNS.map(col => ({ wch: Math.max(col.header.length, 18) }));
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Active_Tests_Catalog');
  XLSX.writeFile(wb, `MedMarg_Active_Tests_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function parseTestsFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(ws);

        if (!rawJson || rawJson.length === 0) {
          return reject(new Error('Excel file is empty.'));
        }

        const parsedTests = rawJson.map((row, idx) => {
          const code = (row['Test Code *'] || row['Test Code'] || row['code'] || `TEST_${idx + 1}`).toString().trim().toUpperCase();
          const name = (row['Test Name *'] || row['Test Name'] || row['name'] || '').toString().trim();
          if (!name) return null;

          const rawAliases = (row['Alias Names (Comma-separated)'] || row['Alias Names'] || row['aliasNames'] || '').toString();
          const aliasNames = rawAliases.split(',').map(s => s.trim()).filter(Boolean);

          const sampleType = (row['Sample Specimen *'] || row['Sample Specimen'] || row['sampleType'] || 'SERUM').toString().trim().toUpperCase();
          const fasting = (row['Fasting Required (YES/NO) *'] || row['Fasting Required'] || row['fasting'] || 'NO').toString().trim().toUpperCase();
          const tatHours = Number(row['Turnaround Time (Hours)'] || row['tatHours']) || 24;
          const mrp = Number(row['Standard Market MRP (₹) *'] || row['mrp']) || 499;
          const price = Number(row['Base Offer Price (₹) *'] || row['price']) || 299;
          const description = (row['Clinical Description'] || row['description'] || `Clinical laboratory biomarker test for ${name}.`).toString().trim();

          const medmargPrice = Number(row['MedMarg Lab Rate (₹)']) || price;
          const thyrocarePrice = Number(row['Thyrocare Lab Rate (₹)']) || Math.round(price * 1.15);
          const lalpathPrice = Number(row['Dr Lal Lab Rate (₹)']) || Math.round(price * 1.3);

          const slab1P = Number(row['1 Person Slab (₹)']) || price;
          const slab2P = Number(row['2 People Slab (₹/person)']) || Math.round(price * 0.85);
          const slab5P = Number(row['5 People Slab (₹/person)']) || Math.round(price * 0.7);
          const slab10P = Number(row['10+ People Slab (₹/person)']) || Math.round(price * 0.55);

          return {
            id: `TEST_${code}`,
            serialNo: idx + 1,
            code,
            name,
            aliasNames,
            sampleType,
            fasting: fasting === 'YES' ? 'YES' : 'NO',
            category: 'Individual Test',
            mrp,
            price,
            tatHours,
            description,
            active: true,
            labPricing: [
              { labId: 'medmarg', labName: 'MedMarg Central Processing Lab', price: medmargPrice, mrp, tatHours: 12, isMedmargSuggested: true, suggestedLabName: 'MedMarg Processing Lab' },
              { labId: 'thyrocare', labName: 'Thyrocare Technologies Ltd', price: thyrocarePrice, mrp: Math.round(mrp * 1.1), tatHours: 24, isMedmargSuggested: false },
              { labId: 'lalpath', labName: 'Dr. Lal PathLabs', price: lalpathPrice, mrp: Math.round(mrp * 1.2), tatHours: 24, isMedmargSuggested: false }
            ],
            tierPricing: {
              '1': { people: 1, mrp, offerPrice: slab1P, pricePerPerson: slab1P, savings: Math.max(0, mrp - slab1P) },
              '2': { people: 2, mrp: mrp * 2, offerPrice: slab2P * 2, pricePerPerson: slab2P, savings: Math.max(0, mrp * 2 - slab2P * 2) },
              '5': { people: 5, mrp: mrp * 5, offerPrice: slab5P * 5, pricePerPerson: slab5P, savings: Math.max(0, mrp * 5 - slab5P * 5) },
              '10': { people: 10, mrp: mrp * 10, offerPrice: slab10P * 10, pricePerPerson: slab10P, savings: Math.max(0, mrp * 10 - slab10P * 10) }
            }
          };
        }).filter(Boolean);

        resolve(parsedTests);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

// ============================================================================
// 2. INVENTORY SINGLE ITEMS EXCEL TEMPLATE & EXPORT/IMPORT
// ============================================================================

export const INVENTORY_EXCEL_COLUMNS = [
  { header: 'SKU Code *', key: 'code', example: 'STK-01' },
  { header: 'Item Name *', key: 'name', example: 'Gold SST Gel Tubes (5ml)' },
  { header: 'Item Type (SINGLE / KIT) *', key: 'type', example: 'SINGLE' },
  { header: 'Category *', key: 'category', example: 'Blood Containers' },
  { header: 'Central Stock *', key: 'stock', example: 4500 },
  { header: 'Unit *', key: 'unit', example: 'Tubes' },
  { header: 'Reorder Level (MOQ) *', key: 'reorderLevel', example: 1000 },
  { header: 'Unit Cost (₹) *', key: 'unitCost', example: 14 },
  { header: 'Store In-Charge *', key: 'incharge', example: 'Anand Store Lead (store.tirupati@medmarg.com)' }
];

export function downloadInventorySampleTemplate() {
  const sampleRow = {};
  INVENTORY_EXCEL_COLUMNS.forEach(col => {
    sampleRow[col.header] = col.example;
  });

  const ws = XLSX.utils.json_to_sheet([sampleRow]);
  ws['!cols'] = INVENTORY_EXCEL_COLUMNS.map(col => ({ wch: Math.max(col.header.length, String(col.example).length) + 4 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory_Template');
  XLSX.writeFile(wb, 'MedMarg_Inventory_Format_Sample.xlsx');
}

export function exportInventoryToExcel(inventoryStock = []) {
  const rows = inventoryStock.filter(i => i.type === 'SINGLE').map(item => ({
    'SKU Code *': item.code || '',
    'Item Name *': item.name || '',
    'Item Type (SINGLE / KIT) *': item.type || 'SINGLE',
    'Category *': item.category || 'Consumables',
    'Central Stock *': item.stock ?? 0,
    'Unit *': item.unit || 'Units',
    'Reorder Level (MOQ) *': item.reorderLevel ?? 50,
    'Unit Cost (₹) *': item.unitCost ?? 0,
    'Store In-Charge *': item.incharge || 'Store Lead'
  }));

  const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{}]);
  ws['!cols'] = INVENTORY_EXCEL_COLUMNS.map(col => ({ wch: Math.max(col.header.length, 16) }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Single_Inventory_Stock');
  XLSX.writeFile(wb, `MedMarg_Single_Inventory_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function parseInventoryFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(ws);

        if (!rawJson || rawJson.length === 0) {
          return reject(new Error('Excel file is empty.'));
        }

        const parsedItems = rawJson.map((row, idx) => {
          const code = (row['SKU Code *'] || row['SKU Code'] || row['code'] || `STK-${idx + 1}`).toString().trim().toUpperCase();
          const name = (row['Item Name *'] || row['Item Name'] || row['name'] || '').toString().trim();
          if (!name) return null;

          const type = (row['Item Type (SINGLE / KIT) *'] || row['type'] || 'SINGLE').toString().trim().toUpperCase();
          const category = (row['Category *'] || row['category'] || 'Blood Containers').toString().trim();
          const stock = Number(row['Central Stock *'] || row['stock']) || 0;
          const unit = (row['Unit *'] || row['unit'] || 'Tubes').toString().trim();
          const reorderLevel = Number(row['Reorder Level (MOQ) *'] || row['reorderLevel']) || 100;
          const unitCost = Number(row['Unit Cost (₹) *'] || row['unitCost']) || 10;
          const incharge = (row['Store In-Charge *'] || row['incharge'] || 'Anand Store Lead (store.tirupati@medmarg.com)').toString().trim();

          return {
            code,
            name,
            type: type === 'KIT' ? 'KIT' : 'SINGLE',
            category,
            stock,
            unit,
            reorderLevel,
            unitCost,
            incharge,
            alertSent: false,
            components: []
          };
        }).filter(Boolean);

        resolve(parsedItems);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
