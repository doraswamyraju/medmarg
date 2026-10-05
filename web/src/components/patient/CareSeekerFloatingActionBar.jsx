import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  PhoneCall, 
  Search, 
  Sparkles, 
  X,
  ChevronUp
} from 'lucide-react';

export default function CareSeekerFloatingActionBar({
  onOpenSearch = () => {},
  handleOrderWhatsApp = () => {},
  handleOrderCall = () => {}
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '0.6rem'
    }}>
      {/* Expanded Speed-Dial Actions */}
      {isOpen && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* 1. Instant WhatsApp Booking */}
          <button
            onClick={() => handleOrderWhatsApp()}
            style={{
              padding: '0.65rem 1.15rem',
              backgroundColor: '#25D366',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '30px',
              fontWeight: '900',
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 8px 20px rgba(37,211,102,0.35)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <MessageCircle size={17} />
            <span>WhatsApp Booking</span>
          </button>

          {/* 2. Direct Call */}
          <button
            onClick={handleOrderCall}
            style={{
              padding: '0.65rem 1.15rem',
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '30px',
              fontWeight: '900',
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 8px 20px rgba(2,132,199,0.35)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <PhoneCall size={17} />
            <span>Call Phlebotomist</span>
          </button>

          {/* 3. Book Now / Instant Search Focus */}
          <button
            onClick={onOpenSearch}
            style={{
              padding: '0.75rem 1.35rem',
              backgroundColor: '#006B70',
              color: '#FFFFFF',
              border: '1.5px solid #FBBF24',
              borderRadius: '30px',
              fontWeight: '900',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 8px 24px rgba(0,107,112,0.4)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Search size={18} color="#FBBF24" />
            <span>⚡ Book Diagnostic Test</span>
          </button>
        </div>
      )}

      {/* Toggle Floating Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          backgroundColor: '#004D40',
          color: '#FFFFFF',
          border: '2px solid #80CBC4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(0,77,64,0.35)'
        }}
        title="Quick Order Channels"
      >
        {isOpen ? <X size={20} /> : <Sparkles size={20} color="#FBBF24" />}
      </button>
    </div>
  );
}
