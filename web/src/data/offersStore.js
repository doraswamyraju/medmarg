// MedMarg Offers Store with LocalStorage & Server Sync
import { API_BASE, safeFetch } from './apiConfig';

const STORAGE_KEY = 'medmarg_promotions_offers_v2';

export const INITIAL_OFFERS = [
  {
    id: 'off_1',
    title: '⚡ 60-Minute Express Home Phlebotomy',
    subtitle: 'Flat 60% OFF on Aarogyam Full Body Checkup',
    code: 'EXPRESS60',
    price: '₹1,499',
    mrp: '₹3,500',
    gradient: 'linear-gradient(135deg, #004D40 0%, #006B70 100%)',
    badge: 'TOP CHOICE',
    tagColor: '#FEF3C7',
    tagText: '#B45309',
    packageId: 'pkg_aarogyam_13',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'off_2',
    title: '👵 Senior Citizen Diabetic & Cardiac Panel',
    subtitle: 'HbA1c + Fasting Blood Sugar + Lipid Profile',
    code: 'SENIORCARE',
    price: '₹599',
    mrp: '₹1,400',
    gradient: 'linear-gradient(135deg, #1E3A8A 0%, #0284C7 100%)',
    badge: 'POPULAR',
    tagColor: '#E0F2FE',
    tagText: '#0369A1',
    packageId: 'pkg_mm_cardio_diab',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'off_3',
    title: '🌸 Complete Women\'s Vitality & Hormone',
    subtitle: 'Thyroid (T3/T4/TSH), Iron, Calcium & Vitamins D3/B12',
    code: 'WOMENHEALTH',
    price: '₹999',
    mrp: '₹2,200',
    gradient: 'linear-gradient(135deg, #581C87 0%, #9333EA 100%)',
    badge: 'SPECIAL',
    tagColor: '#F3E8FF',
    tagText: '#6B21A8',
    packageId: 'pkg_mm_women_well',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'off_4',
    title: '👨‍👩‍👧 Family & Corporate Wellness Days',
    subtitle: 'Book for 2+ Members & Get ₹500 MedMarg Wallet Cashback',
    code: 'FAMILY500',
    price: '₹500 Cashback',
    mrp: 'Free Home Visit',
    gradient: 'linear-gradient(135deg, #065F46 0%, #059669 100%)',
    badge: 'CASHBACK',
    tagColor: '#D1FAE5',
    tagText: '#047857',
    packageId: 'pkg_mm_master',
    active: true,
    createdAt: new Date().toISOString()
  }
];

export function getStoredOffers() {
  if (typeof window === 'undefined') return INITIAL_OFFERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_OFFERS;
}

export function saveStoredOffers(offers) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
  } catch (e) {}
}
