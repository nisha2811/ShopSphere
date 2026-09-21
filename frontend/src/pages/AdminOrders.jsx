import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, CheckCircle2, ClipboardList, Search, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/http';

const statuses = [
  'PLACED',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED'
];

const nextStatuses = {
  PLACED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: []
};

export default function AdminOrders()
{
  const [orders, setOrders] = useState(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const load = () =>
    api.get('/admin/orders')
      .then((response) => setOrders(response.data))
      .catch((requestError) =>
        setError(requestError.response?.data?.message || 'Unable to load orders')
      );

  useEffect(() => {
    load();
  }, []);

  const update = async (order, next) => {
    try
    {
      await api.patch(`/orders/admin/${order.id}/status`, null, { params: { status: next } });
      toast.success('Order status updated');
      load();
    }
    catch (requestError)
    {
      toast.error(requestError.response?.data?.message || 'Invalid order status transition');
    }
  };

  const counts = useMemo(
    () =>
      orders
        ? statuses.reduce(
            (result, item) => ({
              ...result,
              [item]: orders.filter((order) => order.status === item).length
            }),
            {}
          )
        : {},
    [orders]
  );

  const filtered = useMemo(
    () =>
      orders?.filter((order) => {
        const products = (order.items || [])
          .map((item) => `${item.product?.name || ''} ${item.product?.sku || ''}`)
          .join(' ');
        const text = `${order.user?.email || ''} ${order.shippingAddress || ''} ${products}`.toLowerCase();
        return (!status || order.status === status) && text.includes(query.toLowerCase());
      }) || [],
    [orders, query, status]
  );

  if (error)
    return (
      <div className="container empty">
        <h3>Orders unavailable</h3>
        <p>{error}</p>
      </div>
    );

  if (!orders)
    return <div className="container loading">Loading customer orders...</div>;

  return (
    <div className="container admin">
      <div className="page head">
        <div>
          <span className="eyebrow">CONTROL CENTER</span>
          <h2>Customer orders</h2>
          <p>Analytics and fulfillment overview for every order.</p>
        </div>
      </div>

      <div className="stats order-stats">
        <div className="stat">
          <ClipboardList />
          <span>Total orders</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="stat">
          <BarChart3 />
          <span>Pending</span>
          <strong>
            {(counts.PLACED || 0) + (counts.CONFIRMED || 0) + (counts.PROCESSING || 0)}
          </strong>
        </div>
        <div className="stat">
          <CheckCircle2 />
          <span>Delivered</span>
          <strong>{counts.DELIVERED || 0}</strong>
        </div>
        <div className="stat cancelled-stat">
          <XCircle />
          <span>Cancelled</span>
          <strong>{counts.CANCELLED || 0}</strong>
        </div>
      </div>

      <section className="admin-section analytics">
        <div className="section-title">
          <h3>Order analytics</h3>
          <span className="muted">Live status distribution</span>
        </div>
        <div className="chart-bars">
          {statuses.map((item) => (
            <div className="chart-column" key={item}>
              <strong>{counts[item] || 0}</strong>
              <div
                className="bar"
                style={{
                  height: `${Math.max(
                    8,
                    ((counts[item] || 0) / Math.max(1, orders.length)) * 130
                  )}px`
                }}
              />
              <small>{item.replaceAll('_', ' ')}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <div className="section-title">
          <h3>All orders</h3>
          <span className="muted">{filtered.length} matching orders</span>
        </div>

        <div className="admin-filters">
          <div className="search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search person, address, product, SKU..."
            />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {statuses.map((item) => (
              <option value={item} key={item}>
                {item.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {filtered.length ? (
          <div className="admin-table">
            <div className="admin-table-head">
              <span>Order</span>
              <span>Customer and date</span>
              <span>Products</span>
              <span>Status</span>
            </div>
            {filtered.map((order) => (
              <div className="admin-row order-row" key={order.id}>
                <div>
                  <strong>
                    #{order.id.slice(0, 8).toUpperCase()} · ₹
                    {Number(order.total).toLocaleString('en-IN')}
                  </strong>
                </div>
                <span>
                  {order.user?.email || 'Customer'} · {order.shippingAddress || 'No address'} ·{' '}
                  {new Date(order.createdAt).toLocaleDateString('en-IN')}
                </span>
                <div className="order-products">
                  {(order.items || []).map((item) => (
                    <span key={item.id}>
                      {item.product?.name || 'Product'} · ID {item.product?.id} · Qty {item.quantity}
                    </span>
                  ))}
                </div>
                <select
                  className={`status-select ${order.status.toLowerCase()}`}
                  value={order.status}
                  onChange={(event) => update(order, event.target.value)}
                >
                  {statuses.map((item) => (
                    <option
                      value={item}
                      key={item}
                      disabled={
                        item !== order.status && !nextStatuses[order.status]?.includes(item)
                      }
                    >
                      {item.replaceAll('_', ' ')}
                      {item !== order.status && !nextStatuses[order.status]?.includes(item)
                        ? ' (locked)'
                        : ''}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty compact">
            <ClipboardList size={30} />
            <h3>No matching orders</h3>
          </div>
        )}
      </section>
    </div>
  );
}
