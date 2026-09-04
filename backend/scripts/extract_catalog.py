import zipfile
import xml.etree.ElementTree as ET
import json
import os

def extract_tests_data(xlsx_path, output_json):
    with zipfile.ZipFile(xlsx_path) as z:
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            ss_root = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in ss_root.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                texts = [t.text or '' for t in si.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')]
                shared_strings.append(''.join(texts))
        
        wb_root = ET.fromstring(z.read('xl/workbook.xml'))
        sheets = [(s.attrib.get('name'), s.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')) 
                  for s in wb_root.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheet')]
        
        rels_root = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
        rel_map = {r.attrib.get('Id'): r.attrib.get('Target') for r in rels_root}
        
        result = {'profiles': [], 'tests': [], 'packages': []}
        
        for name, r_id in sheets:
            target = 'xl/' + rel_map[r_id] if not rel_map[r_id].startswith('xl/') else rel_map[r_id]
            sheet_root = ET.fromstring(z.read(target))
            rows = sheet_root.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row')
            
            key = 'profiles' if 'PROFILE' in name.upper() else 'tests'
            
            for row in rows[1:]: # skip header
                cells = []
                for c in row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                    v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                    val = v.text if v is not None else ''
                    if c.attrib.get('t') == 's' and val != '':
                        val = shared_strings[int(val)]
                    cells.append(val.strip())
                
                if len(cells) >= 3 and (cells[1] or cells[2]):
                    item = {
                        'id': f"{'PROF' if key == 'profiles' else 'TEST'}_{cells[0] if cells[0] else len(result[key])+1}",
                        'serialNo': int(cells[0]) if cells[0].isdigit() else len(result[key]) + 1,
                        'code': cells[1] if len(cells) > 1 else '',
                        'name': cells[2] if len(cells) > 2 else '',
                        'sampleType': cells[3] if len(cells) > 3 and cells[3] else 'SERUM',
                        'fasting': cells[4].upper() if len(cells) > 4 and cells[4] else 'NO',
                        'category': 'Diagnostic Profile' if key == 'profiles' else 'Individual Test',
                        'mrp': 1499 if key == 'profiles' else 499,
                        'price': 899 if key == 'profiles' else 299,
                        'tatHours': 24,
                        'description': f"Comprehensive {'diagnostic profile' if key == 'profiles' else 'clinical test'} analyzing {cells[2] if len(cells) > 2 else 'vital biomarkers'}.",
                        'active': True
                    }
                    result[key].append(item)
        
        # Add initial starter packages that combine tests and profiles
        result['packages'] = [
            {
                'id': 'PKG_1',
                'name': 'MedMarg Master Health Checkup (Comprehensive)',
                'code': 'MM_MASTER',
                'tagline': 'Complete 85+ Vital Biomarkers & Full Body Evaluation',
                'category': 'Full Body',
                'mrp': 3999,
                'price': 1499,
                'discountPercent': 62,
                'fasting': 'YES',
                'fastingNote': '10-12 hours overnight fasting required',
                'sampleTypes': ['SERUM', 'EDTA', 'URINE'],
                'tatHours': 24,
                'popular': True,
                'profiles': ['APASTS', 'AAP', 'BEAP', 'CUA'],
                'tests': ['AHGLU', '17OH', 'VITDC', 'ALB', 'SGPT', 'ALC'],
                'testCount': 92,
                'description': 'Our most comprehensive wellness package covering liver, kidney, thyroid, heart, vitamins, allergy screening, and complete blood counts.'
            },
            {
                'id': 'PKG_2',
                'name': 'MedMarg Executive Heart & Diabetes Care',
                'code': 'MM_CARDIO_DIAB',
                'tagline': 'Advanced Lipid, Glycemic Control & Cardiovascular Risk Panel',
                'category': 'Cardio & Diabetes',
                'mrp': 2499,
                'price': 999,
                'discountPercent': 60,
                'fasting': 'YES',
                'fastingNote': '8-10 hours fasting required',
                'sampleTypes': ['SERUM', 'EDTA'],
                'tatHours': 24,
                'popular': True,
                'profiles': ['AAP', 'APR'],
                'tests': ['AHGLU', 'VITDC', 'SGPT', 'SALB'],
                'testCount': 48,
                'description': 'Tailored for early detection of heart risks, insulin resistance, HbA1c, and metabolic markers.'
            },
            {
                'id': 'PKG_3',
                'name': 'MedMarg Complete Allergy & Immunity Profile',
                'code': 'MM_ALLERGY_IMMUNE',
                'tagline': 'Screening for 30+ Food, Inhalant & Environmental Allergens',
                'category': 'Immunity & Allergy',
                'mrp': 4500,
                'price': 1999,
                'discountPercent': 55,
                'fasting': 'NO',
                'fastingNote': 'No fasting required',
                'sampleTypes': ['SERUM'],
                'tatHours': 36,
                'popular': False,
                'profiles': ['APHANI', 'APASTS', 'APCER', 'APCOM', 'APDUST'],
                'tests': ['ACRAB', 'AVB12', 'ADA'],
                'testCount': 35,
                'description': 'Full spectrum IgE allergen profiling covering inhalants, food items, pollen, animal dander, and dust mites.'
            },
            {
                'id': 'PKG_4',
                'name': 'MedMarg Women Wellness & Hormone Shield',
                'code': 'MM_WOMEN_WELL',
                'tagline': 'Female Hormone Balance, Thyroid, Iron & Vitamin Screening',
                'category': 'Women Health',
                'mrp': 3200,
                'price': 1299,
                'discountPercent': 59,
                'fasting': 'YES',
                'fastingNote': '8-10 hours fasting required',
                'sampleTypes': ['SERUM', 'EDTA'],
                'tatHours': 24,
                'popular': True,
                'profiles': ['AdvancedTTFT3-FT4-USTSH', 'E22', 'BEAP'],
                'tests': ['17OH', 'VITDC', 'SALB', 'ALDOS'],
                'testCount': 56,
                'description': 'Designed specifically for women to assess hormonal wellness, thyroid function, calcium, iron, and vitamin D levels.'
            }
        ]
        
        os.makedirs(os.path.dirname(output_json), exist_ok=True)
        with open(output_json, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2)
            
        print(f"SUCCESS: Extracted {len(result['profiles'])} profiles and {len(result['tests'])} tests. Created {len(result['packages'])} starter packages.")
        print(f"Output written to: {output_json}")

if __name__ == '__main__':
    extract_tests_data(r'C:\Users\doras\OneDrive\Desktop\tests data.xlsx', r'd:\MedMarg\backend\data\catalogData.json')
