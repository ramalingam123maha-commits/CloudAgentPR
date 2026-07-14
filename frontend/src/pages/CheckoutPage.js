import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axios';

const STEPS = ['Shipping', 'Payment', 'Review'];

const SHIPPING_COST = 9.99;
const TAX_RATE = 0.08;

const emptyShipping = {
  firstName: '', lastName: '', address: '',
  city: '', state: '', zipCode: '', country: 'United States',
};

const inputSty = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--gray-200)', fontSize: '0.95rem', fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
};
const labelSty = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.4rem' };

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart } = useCart();

  const [step,         setStep]         = useState(0);
  const [shipping,     setShipping]     = useState(emptyShipping);
  const [paymentMethod,setPaymentMethod]= useState('card');
  const [shippingErrors, setShippingErrors] = useState({});
  const [loading,      setLoading]      = useState(false);
  const [orderError,   setOrderError]   = useState('');

  const subtotal = cartTotal;
  const shippingCost = subtotal > 100 ? 0 : SHIPPING_COST;
  const tax   = subtotal * TAX_RATE;
  const total = subtotal + shippingCost + tax;

  /* ---- Validation ---- */
  const validateShipping = () => {
    const errs = {};
    if (!shipping.firstName.trim()) errs.firstName = 'Required';
    if (!shipping.lastName.trim())  errs.lastName  = 'Required';
    if (!shipping.address.trim())   errs.address   = 'Required';
    if (!shipping.city.trim())      errs.city      = 'Required';
    if (!shipping.state.trim())     errs.state     = 'Required';
    if (!shipping.zipCode.trim())   errs.zipCode   = 'Required';
    if (!shipping.country.trim())   errs.country   = 'Required';
    return errs;
  };

  const nextStep = () => {
    if (step === 0) {
      const errs = validateShipping();
      if (Object.keys(errs).length) { setShippingErrors(errs); return; }
      setShippingErrors({});
    }
    setStep(s => s + 1);
  };

  /* ---- Place Order ---- */
  const placeOrder = async () => {
    setLoading(true);
    setOrderError('');
    try {
      const orderItems = items.map(item => {
        const p = item.product || item;
        return {
          product: p._id,
          name: p.name,
          quantity: item.quantity,
          price: Number(item.price || p.price),
          image: (p.images && p.images[0]) || p.imageUrl || '',
        };
      });
      const payload = {
        orderItems,
        shippingAddress: shipping,
        paymentMethod,
        itemsPrice:    subtotal,
        shippingPrice: shippingCost,
        taxPrice:      tax,
        totalPrice:    total,
      };
      const r = await api.post('/orders', payload);
      const order = r.data.order || r.data;
      await clearCart();
      navigate(`/orders/${order._id}`, { state: { justPlaced: true } });
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ---- Step indicator ---- */
  const StepIndicator = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2.5rem', gap: 0 }}>
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
          }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem',
              background: i <= step ? 'var(--primary)' : 'var(--gray-200)',
              color: i <= step ? 'var(--white)' : 'var(--gray-500)',
              transition: 'all 0.2s',
            }}>
              {i < step ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: i === step ? 700 : 500, color: i === step ? 'var(--primary)' : 'var(--gray-500)' }}>
              {s}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: '2px', background: i < step ? 'var(--primary)' : 'var(--gray-200)', maxWidth: '80px', margin: '0 0.5rem', marginBottom: '1.4rem', transition: 'background 0.2s' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  /* ---- Shipping form ---- */
  const ShippingForm = () => (
    <div>
      <h2 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '1.5rem' }}>📦 Shipping Address</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {[
          { key: 'firstName', label: 'First Name', col: 1 },
          { key: 'lastName',  label: 'Last Name',  col: 1 },
        ].map(({ key, label }) => (
          <div key={key}>
            <label style={labelSty}>{label}</label>
            <input type="text" value={shipping[key]}
              onChange={e => { setShipping({ ...shipping, [key]: e.target.value }); setShippingErrors({ ...shippingErrors, [key]: '' }); }}
              style={{ ...inputSty, borderColor: shippingErrors[key] ? 'var(--danger)' : 'var(--gray-200)' }}
              onFocus={e => { if (!shippingErrors[key]) e.target.style.borderColor = 'var(--primary)'; }}
              onBlur={e => { if (!shippingErrors[key]) e.target.style.borderColor = 'var(--gray-200)'; }}
            />
            {shippingErrors[key] && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{shippingErrors[key]}</span>}
          </div>
        ))}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelSty}>Street Address</label>
          <input type="text" value={shipping.address}
            onChange={e => { setShipping({ ...shipping, address: e.target.value }); setShippingErrors({ ...shippingErrors, address: '' }); }}
            placeholder="123 Main St, Apt 4B"
            style={{ ...inputSty, borderColor: shippingErrors.address ? 'var(--danger)' : 'var(--gray-200)' }}
            onFocus={e => { if (!shippingErrors.address) e.target.style.borderColor = 'var(--primary)'; }}
            onBlur={e => { if (!shippingErrors.address) e.target.style.borderColor = 'var(--gray-200)'; }}
          />
          {shippingErrors.address && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{shippingErrors.address}</span>}
        </div>
        {[
          { key: 'city',    label: 'City'    },
          { key: 'state',   label: 'State'   },
          { key: 'zipCode', label: 'ZIP Code'},
          { key: 'country', label: 'Country' },
        ].map(({ key, label }) => (
          <div key={key}>
            <label style={labelSty}>{label}</label>
            <input type="text" value={shipping[key]}
              onChange={e => { setShipping({ ...shipping, [key]: e.target.value }); setShippingErrors({ ...shippingErrors, [key]: '' }); }}
              style={{ ...inputSty, borderColor: shippingErrors[key] ? 'var(--danger)' : 'var(--gray-200)' }}
              onFocus={e => { if (!shippingErrors[key]) e.target.style.borderColor = 'var(--primary)'; }}
              onBlur={e => { if (!shippingErrors[key]) e.target.style.borderColor = 'var(--gray-200)'; }}
            />
            {shippingErrors[key] && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{shippingErrors[key]}</span>}
          </div>
        ))}
      </div>
    </div>
  );

  /* ---- Payment form ---- */
  const PaymentForm = () => (
    <div>
      <h2 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '1.5rem' }}>💳 Payment Method</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {[
          { value: 'card',   label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, Amex' },
          { value: 'paypal', label: 'PayPal',              icon: '🅿️', desc: 'Pay with your PayPal account' },
          { value: 'cod',    label: 'Cash on Delivery',    icon: '💵', desc: 'Pay when your order arrives' },
        ].map(opt => (
          <label key={opt.value} style={{
            display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer',
            border: `2px solid ${paymentMethod === opt.value ? 'var(--primary)' : 'var(--gray-200)'}`,
            borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem',
            background: paymentMethod === opt.value ? 'rgba(108,99,255,0.05)' : 'var(--white)',
            transition: 'all 0.2s',
          }}>
            <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value}
              onChange={() => setPaymentMethod(opt.value)} style={{ accentColor: 'var(--primary)' }} />
            <span style={{ fontSize: '1.4rem' }}>{opt.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{opt.label}</div>
              <div style={{ color: 'var(--gray-500)', fontSize: '0.82rem' }}>{opt.desc}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  /* ---- Review step ---- */
  const ReviewStep = () => (
    <div>
      <h2 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '1.5rem' }}>📋 Review Your Order</h2>

      {/* Shipping summary */}
      <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Shipping To</span>
          <button onClick={() => setStep(0)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--gray-700)' }}>
          {shipping.firstName} {shipping.lastName} · {shipping.address}, {shipping.city}, {shipping.state} {shipping.zipCode}, {shipping.country}
        </p>
      </div>

      {/* Payment summary */}
      <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Payment</span>
          <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--gray-700)', textTransform: 'capitalize' }}>
          {paymentMethod === 'card' ? '💳 Credit / Debit Card' : paymentMethod === 'paypal' ? '🅿️ PayPal' : '💵 Cash on Delivery'}
        </p>
      </div>

      {/* Items */}
      <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>Items ({items.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
        {items.map((item, i) => {
          const p = item.product || item;
          const img = (p.images && p.images[0]) || p.imageUrl || 'https://via.placeholder.com/48';
          const price = Number(item.price || p.price || 0);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: 'var(--gray-100)', borderRadius: 'var(--radius-sm)', padding: '0.65rem' }}>
              <img src={img} alt={p.name} onError={e => { e.target.src = 'https://via.placeholder.com/48'; }} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
              <span style={{ flex: 1, fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</span>
              <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>×{item.quantity}</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>${(price * item.quantity).toFixed(2)}</span>
            </div>
          );
        })}
      </div>

      {orderError && (
        <div style={{ background: '#fff5f5', border: '1.5px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1rem', color: 'var(--danger)', fontWeight: 600, fontSize: '0.88rem' }}>
          ⚠️ {orderError}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem' }}>Checkout</h1>
      <StepIndicator />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Main form */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)', padding: '2rem' }}>
          {step === 0 && <ShippingForm />}
          {step === 1 && <PaymentForm />}
          {step === 2 && <ReviewStep />}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1.5px solid var(--gray-200)' }}>
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} style={{ background: 'var(--gray-100)', color: 'var(--gray-700)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1.5rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                ← Back
              </button>
            ) : <div />}

            {step < 2 ? (
              <button onClick={nextStep} style={{ background: 'var(--primary)', color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.75rem 2rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Continue →
              </button>
            ) : (
              <button onClick={placeOrder} disabled={loading} style={{ background: loading ? 'var(--gray-500)' : 'var(--success)', color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.85rem 2.5rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}>
                {loading ? 'Placing Order…' : '✓ Place Order'}
              </button>
            )}
          </div>
        </div>

        {/* Order summary sidebar */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)', padding: '1.5rem', position: 'sticky', top: '90px' }}>
          <h3 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '1rem' }}>Order Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
            {[
              { l: 'Subtotal',   v: `$${subtotal.toFixed(2)}`       },
              { l: 'Shipping',   v: shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}` },
              { l: 'Tax (8%)',   v: `$${tax.toFixed(2)}`            },
            ].map(({ l, v }) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--gray-700)' }}>
                <span>{l}</span><span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--gray-900)', paddingTop: '0.85rem', fontWeight: 800 }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)', fontSize: '1.15rem' }}>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
