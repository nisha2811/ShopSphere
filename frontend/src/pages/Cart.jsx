import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/http';

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const navigate = useNavigate();

  const load = () =>
    api.get('/cart')
      .then((response) => setCart(response.data))
      .catch(() => toast.error('Unable to load cart'));

  useEffect(load, []);

  const update = async (id, quantity) => {
    try
    {
      await api.patch(`/cart/items/${id}`, null, { params: { quantity } });
      load();
    }
    catch (error)
    {
      toast.error(error.response?.data?.message || 'Unable to update cart');
    }
  };

  const remove = async (id) => {
    try
    {
      await api.delete(`/cart/items/${id}`);
      load();
    }
    catch (error)
    {
      toast.error(error.response?.data?.message || 'Unable to remove item');
    }
  };

  const checkout = (event) => {
    event.preventDefault();
    if (!address.trim()) return;
    setConfirmOpen(true);
  };

  const confirmOrder = async () => {
    setCheckingOut(true);
    try
    {
      const response = await api.post('/orders', {
        shippingAddress: address.trim(),
        paymentMethod
      });
      toast.success('Order placed successfully');
      setConfirmOpen(false);
      navigate(`/orders/${response.data.id}`, { replace: true });
    }
    catch (error)
    {
      toast.error(error.response?.data?.message || 'Checkout failed');
    }
    finally
    {
      setCheckingOut(false);
    }
  };

  if (!cart) return <div className="container loading">Loading cart...</div>;

  if (!cart.items.length)
    return (
      <div className="container">
        <div className="empty">
          <h3>Your cart is waiting.</h3>
          <p>Add something useful to get started.</p>
          <Link className="cta" to="/products">Browse products</Link>
        </div>
      </div>
    );

  const subtotal = Number(cart.subtotal || 0);
  const tax = subtotal * 0.05;
  const shipping = 12;
  const total = subtotal + tax + shipping;

  return (
    <div className="container">
      <div className="page head">
        <div>
          <span className="eyebrow">YOUR BAG</span>
          <h2>Shopping cart</h2>
        </div>
      </div>

      <div className="cart-layout">
        <div>
          {cart.items.map((item) => (
            <div className="cart-item" key={item.id}>
              <img src={item.imageUrl || '/products-lamp.svg'} alt={item.name} />
              <div className="cart-main">
                <span>{item.name}</span>
                <strong>₹{Number(item.unitPrice).toLocaleString('en-IN')}</strong>
                <div className="qty">
                  <button
                    onClick={() => update(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <b>{item.quantity}</b>
                  <button onClick={() => update(item.id, item.quantity + 1)}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <button className="icon" onClick={() => remove(item.id)} title="Remove">
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>

        <aside className="summary">
          <h3>Summary</h3>
          <div>
            <span>Subtotal</span>
            <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
          </div>
          <div>
            <span>Tax (5%)</span>
            <strong>₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
          </div>
          <div>
            <span>Shipping</span>
            <strong>₹{shipping.toFixed(2)}</strong>
          </div>
          <hr />
          <div className="total">
            <span>Total</span>
            <strong>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
          </div>

          <form className="checkout-form" onSubmit={checkout}>
            <label>
              Shipping address
              <textarea
                required
                minLength="5"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="House, street, city, postal code"
              />
            </label>
            <button className="cta full" disabled={checkingOut}>
              <ArrowRight size={17} /> Checkout
            </button>
          </form>
        </aside>
      </div>

      {confirmOpen && (
        <div className="modal-backdrop">
          <div className="checkout-modal">
            <h3>Confirm your order?</h3>
            <p>Review your delivery address and choose a payment method.</p>
            <div className="confirm-address">
              <strong>Shipping to</strong>
              <span>{address}</span>
            </div>

            <fieldset>
              <legend>Payment method</legend>

              <label>
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                /> Cash on delivery
              </label>
              <label>
                <input
                  type="radio"
                  name="payment"
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                /> Card
              </label>
              <label>
                <input
                  type="radio"
                  name="payment"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                /> UPI
              </label>
            </fieldset>

            <div className="modal-actions">
              <button className="textbtn" onClick={() => setConfirmOpen(false)}>Go back</button>
              <button className="cta" onClick={confirmOrder} disabled={checkingOut}>
                {checkingOut ? 'Processing...' : 'Confirm order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
