import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight, ShieldCheck, Sparkles, Building2 } from 'lucide-react';

/**
 * FloatingCartButton / CareSeekerFloatingCartBar
 * Dedicated standalone module for Care Seeker Floating View Cart action.
 * Displays dynamically when 1 or more items are in the cart.
 */
export default function FloatingCartButton({
  cart = [],
  cartTotal = 0,
  onOpenCart = () => {},
  selectedLabProvider = 'medmarg_suggested'
}) {
  const [animateBadge, setAnimateBadge] = useState(false);

  // Trigger subtle micro-bounce when cart items change
  useEffect(() => {
    if (cart.length > 0) {
      setAnimateBadge(true);
      const timer = setTimeout(() => setAnimateBadge(false), 400);
      return () => clearTimeout(timer);
    }
  }, [cart.length, cartTotal]);

  if (!cart || cart.length === 0) return null;

  return (
    <aside
      aria-label="Floating View Cart Bar"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        width: 'min(94vw, 560px)',
        backgroundColor: '#004D40',
        backgroundImage: 'linear-gradient(135deg, #004D40 0%, #005F60 55%, #006B70 100%)',
        borderRadius: '22px',
        padding: '0.85rem 1.25rem',
        border: '2px solid #FBBF24',
        boxShadow: '0 16px 45px rgba(0, 77, 64, 0.48), 0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease',
        userSelect: 'none'
      }}
      onClick={onOpenCart}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-50%) translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(-50%) translateY(0px)'}
    >
      {/* Left section: Bag Icon + Count + Total */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          backgroundColor: '#00332C',
          border: '1.5px solid #80CBC4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0,
          transform: animateBadge ? 'scale(1.15)' : 'scale(1)',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
          <ShoppingBag size={22} color="#FBBF24" />
          <span style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            backgroundColor: '#EF4444',
            color: '#FFFFFF',
            fontSize: '0.72rem',
            fontWeight: '900',
            borderRadius: '50%',
            width: '22px',
            height: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #004D40',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            transform: animateBadge ? 'scale(1.2)' : 'scale(1)',
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            {cart.length}
          </span>
        </div>

        <div>
          <div style={{ color: '#FFFFFF', fontWeight: '900', fontSize: '1.05rem', lineHeight: 1.2 }}>
            {cart.length} Diagnostic Test{cart.length > 1 ? 's' : ''} • <span style={{ color: '#FDE68A' }}>₹{cartTotal}</span>
          </div>
          <div style={{
            color: '#A7F3D0',
            fontSize: '0.76rem',
            fontWeight: '700',
            marginTop: '0.15rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            flexWrap: 'wrap'
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
              <ShieldCheck size={13} color="#34D399" />
              Free Home Phlebotomy
            </span>
            <span>•</span>
            <span style={{ color: '#FDE68A', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
              <Building2 size={12} color="#FBBF24" />
              Select Lab in Cart
            </span>
          </div>
        </div>
      </div>

      {/* Right section: Action button */}
      <button
        type="button"
        id="btn-floating-view-cart"
        onClick={(e) => {
          e.stopPropagation();
          onOpenCart();
        }}
        style={{
          padding: '0.7rem 1.3rem',
          backgroundColor: '#FBBF24',
          color: '#0F172A',
          border: 'none',
          borderRadius: '14px',
          fontWeight: '900',
          fontSize: '0.88rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          boxShadow: '0 4px 16px rgba(251, 191, 36, 0.45)',
          flexShrink: 0,
          transition: 'transform 0.15s ease, background-color 0.15s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
          e.currentTarget.style.backgroundColor = '#F59E0B';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = '#FBBF24';
        }}
      >
        <span>View Cart</span>
        <ArrowRight size={17} />
      </button>
    </aside>
  );
}
