import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Download, PackageCheck } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/http';

const stages = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const date = (value) => {
  const parsed = new Date(value);
  const day = parsed.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
      ? 'nd'
      : day % 10 === 3 && day !== 13
      ? 'rd'
      : 'th';
  return `${day}${suffix} ${parsed.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`;
};

export default function Orders()
{
  const { id } = useParams();
  const [orders, setOrders] = useState(null);
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      api.get(`/orders/${id}`)
        .then((response) => setOrder(response.data))
        .catch(() => toast.error('Unable to load order'));
    } else {
      api.get('/orders')
        .then((response) => setOrders(response.data))
        .catch(() => toast.error('Unable to load orders'));
    }
  }, [id]);

  if (id && !order) return <div className="container loading">Loading order details...</div>;
  if (id) return <OrderDetail order={order} navigate={navigate} />;
  if (!orders) return <div className="container loading">Loading orders...</div>;

  const counts = {
    total: orders.length,
    pending: orders.filter((item) => ['PLACED', 'CONFIRMED', 'PROCESSING'].includes(item.status)).length,
    delivered: orders.filter((item) => item.status === 'DELIVERED').length,
    cancelled: orders.filter((item) => item.status === 'CANCELLED').length
  };

  return (
    <div className="container">
      <div className="page head">
        <div>
          <span className="eyebrow">ACCOUNT</span>
          <h2>Your orders</h2>
          <p>Every purchase, in one place.</p>
        </div>
      </div>

      <br />
      <div className="stats order-stats">
        <div className="stat">
          <span>Total orders</span>
          <strong>{counts.total}</strong>
        </div>
        <div className="stat">
          <span>Pending</span>
          <strong>{counts.pending}</strong>
        </div>
        <div className="stat">
          <span>Delivered</span>
          <strong>{counts.delivered}</strong>
        </div>
        <div className="stat cancelled-stat">
          <span>Cancelled</span>
          <strong>{counts.cancelled}</strong>
        </div>
      </div>

      <br />
      <br />
      {!orders.length ? (
        <div className="empty">
          <PackageCheck size={35} />
          <h3>No orders yet</h3>
          <Link className="cta" to="/products">Browse products</Link>
        </div>
      ) : (
        <div className="orders">
          {orders.map((item) => (
            <Link className="order-card" to={`/orders/${item.id}`} key={item.id}>
              <div>
                <span className="order-id">#{item.id.slice(0, 8).toUpperCase()}</span>
                <h3>{item.items?.[0]?.product?.name || 'Product'}</h3>
                {date(item.createdAt)}
              </div>
              <div>
                <span className={`status ${item.status.toLowerCase()}`}>
                  {item.status.replaceAll('_', ' ')}
                </span>
                <strong>{money(item.total)}</strong>
              </div>
              <ChevronRight />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderDetail({ order, navigate })
{
  const cancel = async () => {
    try {
      await api.post(`/orders/${order.id}/cancel`);
      toast.success('Order cancelled');
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cannot cancel this order');
    }
  };

  const downloadReceipt = () => {
    const lines = [
      'ShopSphere receipt',
      `Order: #${order.id.slice(0, 8).toUpperCase()}`,
      `Placed: ${new Date(order.createdAt).toLocaleString('en-IN')}`,
      `Payment method: ${order.paymentMethod || 'COD'}`,
      `Payment status: ${order.paymentStatus || 'SUCCESS'}`,
      '',
      ...(order.items || []).map(
        (item) =>
          `${item.product?.name || 'Product'} | Product ID: ${item.product?.id || ''} | Qty: ${
            item.quantity
          } | ${money(item.unitPrice)}`
      ),
      '',
      `Subtotal: ${money(order.subtotal)}`,
      `Tax: ${money(order.tax)}`,
      `Shipping: ${money(order.shippingCost)}`,
      `Total: ${money(order.total)}`,
      `Shipping address: ${order.shippingAddress}`
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `shopsphere-receipt-${order.id.slice(0, 8)}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const currentIndex = stages.indexOf(order.status);

  return (
    <div className="container order-detail">
      <button className="back-link" onClick={() => navigate('/orders')}>
        <ArrowLeft size={16} /> Back to orders
      </button>

      <div className="page head">
        <div>
          <span className="eyebrow">ORDER DETAILS</span>
          <h2>#{order.id.slice(0, 8).toUpperCase()}</h2>
          <p>Placed on {new Date(order.createdAt).toLocaleString('en-IN')}</p>
        </div>
        <span className={`status large-status ${order.status.toLowerCase()}`}>
          {order.status.replaceAll('_', ' ')}
        </span>
      </div>

      <section className="order-panel">
        <h3>Delivery progress</h3>
        <div className="timeline">
          {stages.map((stage, index) => (
            <div
              className={`timeline-step ${index <= currentIndex ? 'complete' : ''}`}
              key={stage}
            >
              <span>{index + 1}</span>
              <strong>{stage.replaceAll('_', ' ')}</strong>
              {stage === 'DELIVERED' && index <= currentIndex ? (
                <small>Delivered {date(order.updatedAt || order.createdAt)}</small>
              ) : index === currentIndex ? (
                <small>Current status</small>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <div className="order-detail-grid">
        <section className="order-panel">
          <h3>Products</h3>
          {(order.items || []).map((item, index) => (
            <div className="detail-item" key={item.id}>
              <div>
                <strong>{item.product?.name || 'Product'}</strong>
                <span>Product ID: {item.product?.id}</span>
                <span>SKU: {item.product?.sku || 'Not available'}</span>
                <small>
                  Expected arrival:{' '}
                  {date(new Date(order.createdAt).getTime() + (5 + index * 2) * 86400000)}
                </small>
              </div>
              <strong>
                {item.quantity} × {money(item.unitPrice)}
              </strong>
            </div>
          ))}
        </section>

        <aside className="order-panel">
          <h3>Payment and delivery</h3>
          <div className="payment-badge">
            {order.paymentMethod || 'COD'} · {order.paymentStatus || 'SUCCESS'}
          </div>
          <div className="summary-line">
            <span>Subtotal</span>
            <strong>{money(order.subtotal)}</strong>
          </div>
          <div className="summary-line">
            <span>Tax (5%)</span>
            <strong>{money(order.tax)}</strong>
          </div>
          <div className="summary-line">
            <span>Shipping</span>
            <strong>{money(order.shippingCost)}</strong>
          </div>
          <hr />
          <div className="summary-line total">
             <span>Total</span>
             <strong>{money(order.total)}</strong>
          </div>

          <h4>Shipping address</h4>
          <p>{order.shippingAddress}</p>
                {order.status === 'DELIVERED' && (
                    <button className="cta receipt-button" onClick={downloadReceipt}>
                      <Download size={16} /> Download receipt
                    </button>
                )}

                {['PLACED', 'CONFIRMED', 'PROCESSING'].includes(order.status) && (
                    <button className="cancel-button" onClick={cancel}>
                      Cancel order
                    </button>
                )}
          </aside>
        </div>
      </div>
    );
}