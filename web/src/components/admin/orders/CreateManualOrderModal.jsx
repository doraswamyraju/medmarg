import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Search, 
  User, 
  UserPlus, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Trash2, 
  FlaskConical, 
  Package, 
  Activity, 
  Calendar, 
  Clock, 
  Building2, 
  ShieldCheck, 
  ChevronDown, 
  Sparkles,
  Users,
  CreditCard,
  Percent,
  Check
} from 'lucide-react';
import { API_BASE, safeFetch, safeJson } from '../../../data/apiConfig';

export default function CreateManualOrderModal({
  isOpen,
  onClose,
  catalog = { tests: [], profiles: [], packages: [] },
  salariedAgents = [],
  labPartners = [],
  onOrderCreated = () => {}
}) {
  // Navigation / Tab Steps
  const [activeStep, setActiveStep] = useState(1); // 1: Patient, 2: Items & Tests, 3: Schedule & Labs

  // Patient Search & Selection State
  const [customers, setCustomers] = useState([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [customAddress, setCustomAddress] = useState('');

  // New Patient Form (Inline Creation)
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: 'Male',
    city: 'Tirupati',
    address: '',
    pincode: '517501',
    landmark: ''
  });

  // Catalog Item Search & Basket State
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [itemCategoryFilter, setItemCategoryFilter] = useState('ALL'); // 'ALL' | 'TESTS' | 'PROFILES' | 'PACKAGES'
  const [cartItems, setCartItems] = useState([]);
  const [itemDropdownOpen, setItemDropdownOpen] = useState(false);
  const searchDropdownRef = useRef(null);

  // Scheduling & Assignment State
  const [orderDate, setOrderDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [orderSlot, setOrderSlot] = useState('07:30 AM - 08:30 AM');
  const [assignedAgent, setAssignedAgent] = useState('Unassigned');
  const [selectedLab, setSelectedLab] = useState(
    labPartners[0]?.name || 'MedMarg Central Processing Lab'
  );
  const [paymentMode, setPaymentMode] = useState('PAY_AT_DOORSTEP'); // 'PAY_AT_DOORSTEP' | 'PREPAID_ONLINE'
  const [orderNotes, setOrderNotes] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Available Time Slots
  const timeSlots = [
    '06:30 AM - 07:30 AM',
    '07:30 AM - 08:30 AM',
    '08:30 AM - 09:30 AM',
    '09:30 AM - 10:30 AM',
    '10:30 AM - 11:30 AM',
    '04:30 PM - 05:30 PM',
    '05:30 PM - 06:30 PM'
  ];

  // Fetch Customers for Live Auto-suggest
  useEffect(() => {
    if (!isOpen) return;
    async function loadCustomers() {
      setIsSearchingCustomer(true);
      try {
        const res = await safeFetch(`${API_BASE}/api/v1/customers`);
        const data = await safeJson(res);
        if (data && Array.isArray(data.customers)) {
          setCustomers(data.customers);
        }
      } catch (err) {
        console.warn('Could not load customers for auto-suggest:', err);
      } finally {
        setIsSearchingCustomer(false);
      }
    }
    loadCustomers();
  }, [isOpen]);

  // Click outside to close test search dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target)) {
        setItemDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Filtered Customers based on Search
  const filteredCustomers = customerSearchQuery.trim()
    ? customers.filter(c => {
        const q = customerSearchQuery.toLowerCase();
        return (
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.phone && c.phone.includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.abhaId && c.abhaId.toLowerCase().includes(q))
        );
      }).slice(0, 8)
    : [];

  // Filter Catalog Items for Order Cart
  const testsList = (catalog.tests || []).map(t => ({
    ...t,
    type: 'TEST',
    price: Number(t.price || t.mrp || 299),
    displayType: 'Single Test'
  }));

  const profilesList = (catalog.profiles || []).map(p => ({
    ...p,
    type: 'PROFILE',
    price: Number(p.price || p.mrp || 699),
    displayType: 'Diagnostic Profile'
  }));

  const packagesList = (catalog.packages || []).map(pkg => ({
    ...pkg,
    type: 'PACKAGE',
    price: Number(pkg.price || pkg.offerPrice || pkg.mrp || 1299),
    displayType: 'Health Package'
  }));

  let allCatalogItems = [];
  if (itemCategoryFilter === 'ALL') {
    allCatalogItems = [...packagesList, ...profilesList, ...testsList];
  } else if (itemCategoryFilter === 'TESTS') {
    allCatalogItems = testsList;
  } else if (itemCategoryFilter === 'PROFILES') {
    allCatalogItems = profilesList;
  } else if (itemCategoryFilter === 'PACKAGES') {
    allCatalogItems = packagesList;
  }

  const filteredCatalogItems = itemSearchQuery.trim()
    ? allCatalogItems.filter(item => {
        const q = itemSearchQuery.toLowerCase();
        return (
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.code && item.code.toLowerCase().includes(q)) ||
          (item.category && item.category.toLowerCase().includes(q))
        );
      }).slice(0, 10)
    : [];

  // Select an existing customer
  const handleSelectCustomer = (cust) => {
    setSelectedCustomer(cust);
    setSelectedAddressIndex(0);
    setCustomAddress('');
    setShowNewPatientForm(false);
    setCustomerSearchQuery('');
  };

  // Add Item to Cart
  const handleAddToCart = (item) => {
    const existingIndex = cartItems.findIndex(i => i.id === item.id && i.type === item.type);
    if (existingIndex > -1) {
      setCartItems(prev => {
        const next = [...prev];
        next[existingIndex].quantity = (next[existingIndex].quantity || 1) + 1;
        return next;
      });
    } else {
      setCartItems(prev => [
        ...prev,
        {
          id: item.id || `ITEM-${Date.now()}`,
          code: item.code || '',
          name: item.name || 'Diagnostic Item',
          type: item.type,
          price: Number(item.price) || 0,
          sampleType: item.sampleType || item.sample || 'EDTA / SERUM',
          fasting: item.fasting || 'NO',
          quantity: 1
        }
      ]);
    }
    setItemSearchQuery('');
    setItemDropdownOpen(false);
  };

  // Remove Item from Cart
  const handleRemoveFromCart = (index) => {
    setCartItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Update item quantity
  const handleUpdateQuantity = (index, delta) => {
    setCartItems(prev => {
      const next = [...prev];
      const newQty = (next[index].quantity || 1) + delta;
      if (newQty <= 0) {
        return next.filter((_, idx) => idx !== index);
      }
      next[index].quantity = newQty;
      return next;
    });
  };

  // Calculate Totals
  const subtotal = cartItems.reduce((acc, curr) => acc + (curr.price * (curr.quantity || 1)), 0);
  const finalTotal = Math.max(0, subtotal - Number(discountAmount || 0));

  // Handle Quick Add New Patient Submission
  const handleCreateNewPatient = async () => {
    if (!newPatientData.name.trim() || !newPatientData.phone.trim()) {
      setErrorMessage('Patient Name and Phone Number are required.');
      return;
    }

    const fullAddr = newPatientData.landmark 
      ? `${newPatientData.address}, Near ${newPatientData.landmark}, ${newPatientData.city} - ${newPatientData.pincode}`
      : `${newPatientData.address}, ${newPatientData.city} - ${newPatientData.pincode}`;

    const newCustPayload = {
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newPatientData.name.trim(),
      phone: newPatientData.phone.trim(),
      email: newPatientData.email.trim(),
      city: newPatientData.city || 'Tirupati',
      age: Number(newPatientData.age) || 30,
      gender: newPatientData.gender,
      bloodGroup: 'O+',
      abhaId: `ABHA-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      locations: [
        {
          id: `LOC-${Date.now()}`,
          label: 'Primary Doorstep Address',
          fullAddress: fullAddr,
          pincode: newPatientData.pincode || '517501',
          landmark: newPatientData.landmark,
          isPrimary: true
        }
      ],
      familyMembers: [],
      orderHistory: []
    };

    try {
      await fetch(`${API_BASE}/api/v1/admin/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustPayload)
      });
      setCustomers(prev => [newCustPayload, ...prev]);
      setSelectedCustomer(newCustPayload);
      setSelectedAddressIndex(0);
      setShowNewPatientForm(false);
      setErrorMessage('');
    } catch (err) {
      console.warn('Customer auto-creation fallback:', err);
      // Fallback selection in case of network issue
      setSelectedCustomer(newCustPayload);
      setSelectedAddressIndex(0);
      setShowNewPatientForm(false);
    }
  };

  // Determine active address string
  const getEffectiveAddress = () => {
    if (customAddress.trim()) return customAddress.trim();
    if (selectedCustomer && selectedCustomer.locations && selectedCustomer.locations[selectedAddressIndex]) {
      return selectedCustomer.locations[selectedAddressIndex].fullAddress;
    }
    if (selectedCustomer?.city) {
      return `Central Doorstep Collection, ${selectedCustomer.city}`;
    }
    return 'Air Bypass Road, Tirupati, AP - 517501';
  };

  // Final Order Creation Handler
  const handleSubmitLiveOrder = async () => {
    if (!selectedCustomer && !newPatientData.name) {
      setErrorMessage('Please select or create a patient first.');
      setActiveStep(1);
      return;
    }
    if (cartItems.length === 0) {
      setErrorMessage('Please add at least one Test, Profile, or Package to the order cart.');
      setActiveStep(2);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const patientName = selectedCustomer ? selectedCustomer.name : newPatientData.name;
    const patientPhone = selectedCustomer ? selectedCustomer.phone : newPatientData.phone;
    const finalAddress = getEffectiveAddress();
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const orderId = `MM-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderPayload = {
      id: orderId,
      patientName: patientName,
      careSeekerName: patientName,
      phone: patientPhone,
      patientPhone: patientPhone,
      city: selectedCustomer?.city || newPatientData.city || 'Tirupati',
      address: finalAddress,
      items: cartItems.map(i => `${i.name}${i.quantity > 1 ? ` x${i.quantity}` : ''}`).join(', '),
      itemsDetails: cartItems,
      amount: finalTotal,
      totalAmount: finalTotal,
      subtotal: subtotal,
      discount: discountAmount,
      status: assignedAgent === 'Unassigned' ? 'PENDING_DISPATCH' : 'EN_ROUTE',
      assignedAgent: assignedAgent,
      lab: selectedLab,
      labName: selectedLab,
      slot: `${orderDate}, ${orderSlot}`,
      date: orderDate,
      otp: generatedOtp,
      handoverOtp: generatedOtp,
      paymentMode: paymentMode,
      paymentStatus: paymentMode === 'PREPAID_ONLINE' ? 'PAID_SUCCESS' : 'PENDING_DOORSTEP',
      notes: orderNotes,
      createdAt: `Today ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };

    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await safeJson(res);
      const createdOrder = (data && data.order) ? data.order : orderPayload;

      onOrderCreated(createdOrder);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.warn('Live order creation fallback:', err);
      onOrderCreated(orderPayload);
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(5px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        width: '100%',
        maxWidth: '960px',
        maxHeight: '92vh',
        borderRadius: '24px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#006B70',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              boxShadow: '0 4px 12px rgba(0, 107, 112, 0.25)'
            }}>
              <Sparkles size={22} color="#FBBF24" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                  Create Manual Test Order
                </h3>
                <span style={{
                  padding: '0.2rem 0.55rem',
                  backgroundColor: '#E0F2FE',
                  color: '#0284C7',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: '800'
                }}>
                  STANDALONE MODULE
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0 0', color: '#64748B', fontSize: '0.82rem' }}>
                Instant patient lookup, dynamic multi-item catalog cart & doorstep dispatch routing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Multi-Step Wizard Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          padding: '0 1.75rem'
        }}>
          {[
            { num: 1, label: '1. Patient & Doorstep Address', icon: User },
            { num: 2, label: '2. Tests & Catalog Cart', icon: FlaskConical },
            { num: 3, label: '3. Schedule, Agent & Lab Routing', icon: Building2 }
          ].map(s => {
            const Icon = s.icon;
            const isActive = activeStep === s.num;
            return (
              <button
                key={s.num}
                onClick={() => setActiveStep(s.num)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.9rem 1.25rem',
                  border: 'none',
                  borderBottom: isActive ? '3px solid #006B70' : '3px solid transparent',
                  backgroundColor: 'transparent',
                  color: isActive ? '#006B70' : '#64748B',
                  fontWeight: isActive ? '900' : '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} color={isActive ? '#006B70' : '#94A3B8'} />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body - Scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem' }}>
          {errorMessage && (
            <div style={{
              padding: '0.85rem 1.15rem',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '12px',
              color: '#991B1B',
              fontSize: '0.85rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: PATIENT SEARCH & ADDRESS */}
          {activeStep === 1 && (
            <div>
              {/* Patient Selection Card */}
              {!selectedCustomer && !showNewPatientForm ? (
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.85rem'
                  }}>
                    <label style={{ fontSize: '0.88rem', fontWeight: '800', color: '#1E293B' }}>
                      Search Registered Patients (Live Database)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewPatientForm(true)}
                      style={{
                        padding: '0.45rem 0.9rem',
                        backgroundColor: '#F0FDFA',
                        color: '#006B70',
                        border: '1px solid #99F6E4',
                        borderRadius: '8px',
                        fontWeight: '800',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <UserPlus size={15} /> + Add New Patient
                    </button>
                  </div>

                  <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Search patient by Name, Phone (+91), Email or ABHA ID..."
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem 0.8rem 2.8rem',
                        borderRadius: '12px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.9rem',
                        color: '#0F172A',
                        outline: 'none',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    />
                  </div>

                  {/* Auto-suggest Results */}
                  {filteredCustomers.length > 0 && (
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
                      overflow: 'hidden',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{ padding: '0.6rem 1rem', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>
                        Matching Patients ({filteredCustomers.length})
                      </div>
                      <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                        {filteredCustomers.map(cust => (
                          <div
                            key={cust.id}
                            onClick={() => handleSelectCustomer(cust)}
                            style={{
                              padding: '0.85rem 1.25rem',
                              borderBottom: '1px solid #F1F5F9',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              cursor: 'pointer',
                              transition: 'background-color 0.12s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0FDFA'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                              <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                backgroundColor: '#E0F2FE',
                                color: '#0284C7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '900',
                                fontSize: '0.85rem'
                              }}>
                                {cust.name ? cust.name.charAt(0).toUpperCase() : 'P'}
                              </div>
                              <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0F172A' }}>
                                  {cust.name}
                                  {cust.abhaId && (
                                    <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: '#006B70', backgroundColor: '#E0F2FE', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>
                                      ABHA
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', gap: '0.75rem', marginTop: '0.15rem' }}>
                                  <span><Phone size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> {cust.phone}</span>
                                  {cust.city && <span><MapPin size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> {cust.city}</span>}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              style={{
                                padding: '0.4rem 0.85rem',
                                backgroundColor: '#006B70',
                                color: '#FFF',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '800',
                                fontSize: '0.78rem',
                                cursor: 'pointer'
                              }}
                            >
                              Select Patient
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state hint */}
                  {customerSearchQuery.trim() && filteredCustomers.length === 0 && (
                    <div style={{
                      padding: '2rem',
                      textAlign: 'center',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '16px',
                      border: '1px dashed #CBD5E1',
                      marginBottom: '1.5rem'
                    }}>
                      <User size={36} color="#94A3B8" style={{ margin: '0 auto 0.75rem' }} />
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B' }}>
                        No patient found matching "{customerSearchQuery}"
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.35rem 0 1rem' }}>
                        Create a new patient record with address in 30 seconds.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewPatientForm(true);
                          setNewPatientData(prev => ({
                            ...prev,
                            name: isNaN(customerSearchQuery) ? customerSearchQuery : '',
                            phone: !isNaN(customerSearchQuery) ? customerSearchQuery : ''
                          }));
                        }}
                        style={{
                          padding: '0.6rem 1.25rem',
                          backgroundColor: '#006B70',
                          color: '#FFF',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: '800',
                          fontSize: '0.84rem',
                          cursor: 'pointer'
                        }}
                      >
                        + Create Patient "{customerSearchQuery}"
                      </button>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Selected Customer Active Dossier Card */}
              {selectedCustomer && (
                <div style={{
                  backgroundColor: '#F0FDFA',
                  borderRadius: '16px',
                  border: '1.5px solid #99F6E4',
                  padding: '1.25rem 1.5rem',
                  marginBottom: '1.5rem',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '14px',
                        backgroundColor: '#006B70',
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '900',
                        fontSize: '1.1rem'
                      }}>
                        {selectedCustomer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                            {selectedCustomer.name}
                          </h4>
                          <span style={{
                            padding: '0.15rem 0.5rem',
                            backgroundColor: '#CCFBF1',
                            color: '#0F766E',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: '800'
                          }}>
                            {selectedCustomer.id}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                          <span><strong>Phone:</strong> {selectedCustomer.phone}</span>
                          {selectedCustomer.email && <span><strong>Email:</strong> {selectedCustomer.email}</span>}
                          {selectedCustomer.city && <span><strong>City:</strong> {selectedCustomer.city}</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(null);
                        setCustomerSearchQuery('');
                      }}
                      style={{
                        padding: '0.35rem 0.75rem',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        color: '#64748B',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Change Patient
                    </button>
                  </div>

                  {/* Customer Saved Locations Picker */}
                  <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #CCFBF1' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F766E', marginBottom: '0.6rem', display: 'block' }}>
                      Doorstep Collection Address for Phlebotomist Dispatch:
                    </label>

                    {selectedCustomer.locations && selectedCustomer.locations.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                        {selectedCustomer.locations.map((loc, idx) => {
                          const isSelected = selectedAddressIndex === idx && !customAddress;
                          return (
                            <div
                              key={loc.id || idx}
                              onClick={() => {
                                setSelectedAddressIndex(idx);
                                setCustomAddress('');
                              }}
                              style={{
                                padding: '0.85rem',
                                borderRadius: '12px',
                                border: isSelected ? '2px solid #006B70' : '1px solid #CBD5E1',
                                backgroundColor: isSelected ? '#FFFFFF' : '#F8FAFC',
                                cursor: 'pointer',
                                transition: 'all 0.12s ease',
                                position: 'relative'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: isSelected ? '#006B70' : '#475569' }}>
                                  <MapPin size={13} style={{ display: 'inline', verticalAlign: '-1px' }} /> {loc.label || 'Saved Address'}
                                </span>
                                {isSelected && <CheckCircle size={15} color="#006B70" />}
                              </div>
                              <p style={{ fontSize: '0.78rem', color: '#334155', margin: 0, lineHeight: 1.4 }}>
                                {loc.fullAddress}
                              </p>
                              {loc.pincode && (
                                <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.35rem', display: 'inline-block' }}>
                                  PIN: {loc.pincode}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.8rem', color: '#64748B' }}>No saved addresses found for this patient.</p>
                    )}

                    {/* Or enter a one-time doorstep override address */}
                    <div style={{ marginTop: '0.85rem' }}>
                      <input
                        type="text"
                        placeholder="Or enter a specific doorstep address override & landmark..."
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.9rem',
                          backgroundColor: '#FFFFFF',
                          border: customAddress ? '2px solid #006B70' : '1px solid #CBD5E1',
                          borderRadius: '10px',
                          fontSize: '0.85rem',
                          color: '#0F172A'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* INLINE NEW PATIENT FORM */}
              {showNewPatientForm && (
                <div style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '16px',
                  border: '1.5px solid #CBD5E1',
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <UserPlus size={18} color="#006B70" />
                      <h4 style={{ fontSize: '1rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                        Quick Register New Patient
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNewPatientForm(false)}
                      style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700' }}
                    >
                      Cancel
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.3rem' }}>
                        Patient Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Reddy"
                        value={newPatientData.name}
                        onChange={(e) => setNewPatientData({ ...newPatientData, name: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.3rem' }}>
                        Phone Number (+91) *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={newPatientData.phone}
                        onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.3rem' }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="patient@gmail.com"
                        value={newPatientData.email}
                        onChange={(e) => setNewPatientData({ ...newPatientData, email: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.3rem' }}>
                        Age
                      </label>
                      <input
                        type="number"
                        placeholder="35"
                        value={newPatientData.age}
                        onChange={(e) => setNewPatientData({ ...newPatientData, age: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.3rem' }}>
                        Gender
                      </label>
                      <select
                        value={newPatientData.gender}
                        onChange={(e) => setNewPatientData({ ...newPatientData, gender: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFF' }}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.3rem' }}>
                      Doorstep Address & Street *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 302, Royal Towers, Air Bypass Road"
                      value={newPatientData.address}
                      onChange={(e) => setNewPatientData({ ...newPatientData, address: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.3rem' }}>
                        Landmark
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Opp Reliance Smart"
                        value={newPatientData.landmark}
                        onChange={(e) => setNewPatientData({ ...newPatientData, landmark: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.3rem' }}>
                        City
                      </label>
                      <input
                        type="text"
                        value={newPatientData.city}
                        onChange={(e) => setNewPatientData({ ...newPatientData, city: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.3rem' }}>
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={newPatientData.pincode}
                        onChange={(e) => setNewPatientData({ ...newPatientData, pincode: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={handleCreateNewPatient}
                      style={{
                        padding: '0.6rem 1.25rem',
                        backgroundColor: '#006B70',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Save Patient & Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Next Step Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  disabled={!selectedCustomer && !newPatientData.name}
                  onClick={() => {
                    if (!selectedCustomer && !newPatientData.name) {
                      setErrorMessage('Please select an existing patient or add a new patient.');
                      return;
                    }
                    setErrorMessage('');
                    setActiveStep(2);
                  }}
                  style={{
                    padding: '0.75rem 1.75rem',
                    backgroundColor: (!selectedCustomer && !newPatientData.name) ? '#CBD5E1' : '#006B70',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '900',
                    fontSize: '0.9rem',
                    cursor: (!selectedCustomer && !newPatientData.name) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(0,107,112,0.2)'
                  }}
                >
                  Proceed to Tests & Packages →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TESTS / PROFILES / PACKAGES CATALOG PICKER & CART */}
          {activeStep === 2 && (
            <div>
              {/* Category Pills & Search Bar */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[
                      { key: 'ALL', label: 'All Catalog Items', icon: Sparkles },
                      { key: 'PACKAGES', label: 'Health Packages', icon: Package },
                      { key: 'PROFILES', label: 'Diagnostic Profiles', icon: Activity },
                      { key: 'TESTS', label: 'Single Tests', icon: FlaskConical }
                    ].map(tab => {
                      const Icon = tab.icon;
                      const isSel = itemCategoryFilter === tab.key;
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setItemCategoryFilter(tab.key)}
                          style={{
                            padding: '0.45rem 0.85rem',
                            borderRadius: '8px',
                            border: isSel ? '1.5px solid #006B70' : '1px solid #CBD5E1',
                            backgroundColor: isSel ? '#E0F2FE' : '#FFFFFF',
                            color: isSel ? '#006B70' : '#475569',
                            fontWeight: isSel ? '800' : '600',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          <Icon size={14} color={isSel ? '#006B70' : '#64748B'} />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Catalog Source: <strong>{catalog.tests?.length || 0}</strong> Tests, <strong>{catalog.profiles?.length || 0}</strong> Profiles, <strong>{catalog.packages?.length || 0}</strong> Packages
                  </span>
                </div>

                {/* Auto-suggest Search Bar */}
                <div style={{ position: 'relative' }} ref={searchDropdownRef}>
                  <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search test by name, short code (e.g. CBC, HbA1c, LFT, Lipid, Master Health)..."
                    value={itemSearchQuery}
                    onChange={(e) => {
                      setItemSearchQuery(e.target.value);
                      setItemDropdownOpen(true);
                    }}
                    onFocus={() => setItemDropdownOpen(true)}
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem 0.8rem 2.8rem',
                      borderRadius: '12px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.9rem',
                      color: '#0F172A',
                      outline: 'none',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  />

                  {/* Dropdown Results */}
                  {itemDropdownOpen && filteredCatalogItems.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '0.4rem',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      border: '1px solid #CBD5E1',
                      boxShadow: '0 15px 30px rgba(0,0,0,0.12)',
                      maxHeight: '320px',
                      overflowY: 'auto',
                      zIndex: 100
                    }}>
                      {filteredCatalogItems.map(item => (
                        <div
                          key={`${item.type}-${item.id || item.code}`}
                          onClick={() => handleAddToCart(item)}
                          style={{
                            padding: '0.85rem 1.25rem',
                            borderBottom: '1px solid #F1F5F9',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'background-color 0.12s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0FDFA'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                fontWeight: '800',
                                backgroundColor: item.type === 'PACKAGE' ? '#FEF3C7' : (item.type === 'PROFILE' ? '#E0F2FE' : '#F1F5F9'),
                                color: item.type === 'PACKAGE' ? '#92400E' : (item.type === 'PROFILE' ? '#0369A1' : '#475569')
                              }}>
                                {item.displayType}
                              </span>
                              <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0F172A' }}>
                                {item.name}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.2rem' }}>
                              <span>Code: {item.code || 'N/A'}</span> • <span>Sample: {item.sampleType || 'EDTA/Serum'}</span> • <span>Fasting: {item.fasting || 'NO'}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <span style={{ fontSize: '1rem', fontWeight: '900', color: '#006B70' }}>
                              ₹{item.price}
                            </span>
                            <button
                              type="button"
                              style={{
                                padding: '0.4rem 0.85rem',
                                backgroundColor: '#006B70',
                                color: '#FFF',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '800',
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              <Plus size={14} /> Add
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Cart Table */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  padding: '0.85rem 1.25rem',
                  backgroundColor: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: '900', color: '#0F172A' }}>
                    Order Basket Items ({cartItems.length})
                  </div>
                  {cartItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCartItems([])}
                      style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {cartItems.length === 0 ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94A3B8' }}>
                    <FlaskConical size={40} style={{ margin: '0 auto 0.75rem' }} />
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#475569' }}>
                      Order Basket is Empty
                    </div>
                    <p style={{ fontSize: '0.82rem', margin: '0.35rem 0 0' }}>
                      Type above to search and select tests or packages to add to this order.
                    </p>
                  </div>
                ) : (
                  <div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: '800', fontSize: '0.75rem' }}>
                          <th style={{ padding: '0.75rem 1.25rem' }}>ITEM DETAILS</th>
                          <th style={{ padding: '0.75rem 1rem' }}>SAMPLE & FASTING</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>QTY</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>UNIT PRICE</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>SUBTOTAL</th>
                          <th style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>REMOVE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item, idx) => (
                          <tr key={`${item.id}-${idx}`} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '0.85rem 1.25rem' }}>
                              <div style={{ fontWeight: '800', color: '#0F172A' }}>{item.name}</div>
                              <span style={{
                                fontSize: '0.7rem',
                                color: '#006B70',
                                backgroundColor: '#E0F2FE',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '4px',
                                fontWeight: '800'
                              }}>
                                {item.type}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>
                              <div>{item.sampleType}</div>
                              <span style={{ fontSize: '0.72rem', color: item.fasting === 'YES' ? '#D97706' : '#16A34A', fontWeight: '800' }}>
                                Fasting: {item.fasting}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '6px', overflow: 'hidden' }}>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuantity(idx, -1)}
                                  style={{ padding: '0.2rem 0.5rem', background: '#F8FAFC', border: 'none', cursor: 'pointer', fontWeight: '800' }}
                                >
                                  -
                                </button>
                                <span style={{ padding: '0.2rem 0.6rem', fontWeight: '800', fontSize: '0.82rem' }}>
                                  {item.quantity || 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuantity(idx, 1)}
                                  style={{ padding: '0.2rem 0.5rem', background: '#F8FAFC', border: 'none', cursor: 'pointer', fontWeight: '800' }}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: '700', color: '#475569' }}>
                              ₹{item.price}
                            </td>
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: '900', color: '#006B70' }}>
                              ₹{item.price * (item.quantity || 1)}
                            </td>
                            <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveFromCart(idx)}
                                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', transition: 'color 0.12s' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Price Breakdown Summary */}
                    <div style={{ padding: '1rem 1.5rem', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ width: '280px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748B', marginBottom: '0.35rem' }}>
                          <span>Tests Subtotal:</span>
                          <span style={{ fontWeight: '800', color: '#0F172A' }}>₹{subtotal}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#64748B', marginBottom: '0.5rem' }}>
                          <span>Special Discount (₹):</span>
                          <input
                            type="number"
                            value={discountAmount}
                            onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                            style={{ width: '80px', padding: '0.2rem 0.4rem', textAlign: 'right', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: '800' }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: '900', color: '#006B70', paddingTop: '0.5rem', borderTop: '1.5px solid #CBD5E1' }}>
                          <span>Grand Total:</span>
                          <span>₹{finalTotal}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    border: '1px solid #CBD5E1',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  ← Back to Patient
                </button>

                <button
                  type="button"
                  disabled={cartItems.length === 0}
                  onClick={() => {
                    if (cartItems.length === 0) {
                      setErrorMessage('Please add at least one item to proceed.');
                      return;
                    }
                    setErrorMessage('');
                    setActiveStep(3);
                  }}
                  style={{
                    padding: '0.75rem 1.75rem',
                    backgroundColor: cartItems.length === 0 ? '#CBD5E1' : '#006B70',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '900',
                    fontSize: '0.9rem',
                    cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(0,107,112,0.2)'
                  }}
                >
                  Proceed to Schedule & Lab Routing →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SCHEDULE, PHLEBOTOMIST & LAB ROUTING */}
          {activeStep === 3 && (
            <div>
              {/* Order Summary Strip */}
              <div style={{
                backgroundColor: '#F0FDFA',
                borderRadius: '16px',
                border: '1px solid #99F6E4',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#0F766E', fontWeight: '800' }}>PATIENT SUMMARY</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0F172A' }}>
                    {selectedCustomer?.name || newPatientData.name} ({selectedCustomer?.phone || newPatientData.phone})
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.15rem' }}>
                    <MapPin size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> {getEffectiveAddress()}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.78rem', color: '#0F766E', fontWeight: '800' }}>ITEMS ({cartItems.length}) & AMOUNT</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#006B70' }}>
                    ₹{finalTotal}
                  </div>
                </div>
              </div>

              {/* Scheduling Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                    <Calendar size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> Doorstep Sample Collection Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem', color: '#0F172A' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                    <Clock size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> Scheduled Time Slot *
                  </label>
                  <select
                    value={orderSlot}
                    onChange={(e) => setOrderSlot(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem', color: '#0F172A', backgroundColor: '#FFF' }}
                  >
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assignment & Lab Partner Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                    <Users size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> Assign Phlebotomist / Fleet Dispatch
                  </label>
                  <select
                    value={assignedAgent}
                    onChange={(e) => setAssignedAgent(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem', color: '#0F172A', backgroundColor: '#FFF' }}
                  >
                    <option value="Unassigned">Unassigned (Auto-Dispatch Engine)</option>
                    {salariedAgents.map(ag => (
                      <option key={ag.id} value={`${ag.name} (${ag.id})`}>
                        {ag.name} ({ag.id}) - {ag.area || 'Tirupati'}
                      </option>
                    ))}
                    <option value="🚀 FCM Freelancer Broadcast Network">
                      🚀 FCM Freelancer Broadcast Network (Open Market)
                    </option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                    <Building2 size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> Sample Processing Lab *
                  </label>
                  <select
                    value={selectedLab}
                    onChange={(e) => setSelectedLab(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem', color: '#0F172A', backgroundColor: '#FFF' }}
                  >
                    {labPartners.map(l => (
                      <option key={l.id} value={l.name}>{l.name} ({l.nabl || 'NABL Accredited'})</option>
                    ))}
                    <option value="MedMarg Central Processing Lab">MedMarg Central Processing Lab (Primary Hub)</option>
                  </select>
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '0.5rem' }}>
                  <CreditCard size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> Payment Collection Mode
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div
                    onClick={() => setPaymentMode('PAY_AT_DOORSTEP')}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      border: paymentMode === 'PAY_AT_DOORSTEP' ? '2px solid #006B70' : '1px solid #CBD5E1',
                      backgroundColor: paymentMode === 'PAY_AT_DOORSTEP' ? '#F0FDFA' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: paymentMode === 'PAY_AT_DOORSTEP' ? '6px solid #006B70' : '2px solid #CBD5E1',
                      backgroundColor: '#FFF'
                    }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>Pay at Doorstep (Cash / Dynamic UPI QR)</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Collected by phlebotomist during visit</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMode('PREPAID_ONLINE')}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      border: paymentMode === 'PREPAID_ONLINE' ? '2px solid #006B70' : '1px solid #CBD5E1',
                      backgroundColor: paymentMode === 'PREPAID_ONLINE' ? '#F0FDFA' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: paymentMode === 'PREPAID_ONLINE' ? '6px solid #006B70' : '2px solid #CBD5E1',
                      backgroundColor: '#FFF'
                    }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>Prepaid / Already Paid</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Direct bank transfer / Razorpay invoice link</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Instructions / Notes */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                  Phlebotomist Instructions & Clinical Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Patient has hard-to-find veins, please carry pediatric butterfly needle. Gate bell code 12."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              {/* Navigation & Submit */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    border: '1px solid #CBD5E1',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  ← Back to Basket
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitLiveOrder}
                  style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: '#006B70',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '900',
                    fontSize: '0.95rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(0,107,112,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Sparkles size={18} color="#FBBF24" />
                  {isSubmitting ? 'Creating Live Order...' : `Confirm & Place Live Order (₹${finalTotal})`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
