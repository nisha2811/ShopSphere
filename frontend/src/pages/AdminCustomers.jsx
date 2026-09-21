import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, UserRound, UserX } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/http';

const PAGE_SIZE = 10;

export default function AdminCustomers()
{
    const [users, setUsers] = useState(null);
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(0);
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState('');
    const load = async () => {
        try
        {
            const [userResponse, orderResponse] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/orders')
            ]);

            setUsers(userResponse.data.filter((user) => user.role === 'CUSTOMER'));
            setOrders(orderResponse.data);
        }
        catch (requestError)
        {
            setError(requestError.response?.data?.message ||'Unable to load customers');
        }
    };

    useEffect(() => {
        load();
    }, []);

    const toggle = async (user) => {
        try
        {
            await api.patch(`/admin/users/${user.id}/active`, null,
                {
                    params: {
                        value: !user.active
                    }
                }
            );

            toast.success(
                user.active
                    ? 'Customer deactivated'
                    : 'Customer activated'
            );
            load();
        }
        catch (requestError)
        {
            toast.error(requestError.response?.data?.message ||'Unable to update customer');
        }
    };

    if (error)
    {
        return (
            <div className="container empty">
                <h3>Customer management unavailable</h3>
                <p>{error}</p>
            </div>
        );
    }

    if (!users)
    {
        return (
            <div className="container loading">
                Loading customers...
            </div>
        );
    }

    const visible = users.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const customerOrders = selected
        ? orders.filter(
              (order) =>
                  order.user?.id === selected.id ||
                  order.user?.email === selected.email
          )
        : [];

    return (
        <div className="container admin">
            <div className="page head">
                <div>
                    <span className="eyebrow">CONTROL CENTER</span>
                    <h2>Manage customers</h2>
                    <p> Review customer accounts, contact details, and purchase history.</p>
                </div>
            </div>

            <section className="admin-section">
                <div className="section-title">
                    <h3>Customer accounts</h3>
                    <span className="muted">
                        {users.length} customers
                    </span>
                </div>

                {visible.length ? (
                    <div className="admin-list">
                        {visible.map((user) => (
                            <div
                                className={`admin-row ${
                                    selected?.id === user.id
                                        ? 'selected-row'
                                        : ''
                                }`}
                                key={user.id}
                            >
                                <button
                                    className="customer-cell customer-link"
                                    onClick={() => setSelected(user)}
                                >
                                    <span className="avatar">
                                        <UserRound size={16} />
                                    </span>

                                    <span>
                                        <strong>
                                            {user.firstName} {user.lastName}
                                        </strong>

                                        <span>
                                            {user.email} · Joined{' '}
                                            {new Date(
                                                user.createdAt
                                            ).toLocaleDateString()}
                                        </span>
                                    </span>
                                </button>

                                <button
                                    className="textbtn"
                                    onClick={() => toggle(user)}
                                >
                                    {user.active ? (
                                        <>
                                            <UserX size={15} /> Deactivate
                                        </>
                                    ) : (
                                        'Activate'
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty compact">
                        <UserRound size={30} />
                        <h3>No customers yet</h3>
                    </div>
                )}

                <Pagination
                    page={page}
                    pages={Math.ceil(users.length / PAGE_SIZE)}
                    onChange={setPage}
                />
            </section>

            {selected && (
                <section className="admin-section customer-detail">
                    <div className="section-title">
                        <div>
                            <span className="eyebrow">
                                CUSTOMER PROFILE
                            </span>
                            <h3>
                                {selected.firstName} {selected.lastName}
                            </h3>
                        </div>

                        <button
                            className="textbtn"
                            onClick={() => setSelected(null)}
                        >
                            Close
                        </button>
                    </div>

                    <div className="customer-facts">
                        <span>
                            <b>Email</b>
                            {selected.email}
                        </span>

                        <span>
                            <b>Phone</b>
                            {selected.phone || 'Not provided'}
                        </span>

                        <span>
                            <b>Address</b>
                            {selected.address || 'Not provided'}
                        </span>

                        <span>
                            <b>Account</b>
                            {selected.active ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    <h4>Purchased products</h4>

                    {customerOrders.length ? (
                        customerOrders.map((order) => (
                            <div className="purchase" key={order.id}>
                                <strong>
                                    #{order.id.slice(0, 8).toUpperCase()} ·{' '}
                                    {order.status}
                                </strong>

                                <span>
                                    {new Date(
                                        order.createdAt
                                    ).toLocaleDateString()}{' '}
                                    · ₹
                                    {Number(order.total).toLocaleString(
                                        'en-IN'
                                    )}
                                </span>

                                <div>
                                    {(order.items || []).map((item) => (
                                        <small key={item.id}>
                                            {item.product?.name || 'Product'} ·
                                            Qty {item.quantity}
                                        </small>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="muted">No purchases yet.</p>
                    )}
                </section>
            )}
        </div>
    );
}

function Pagination({ page, pages, onChange })
{
    if (pages <= 1) return null;
    return (
        <div className="pagination">
            <button
                className="icon"
                disabled={page === 0}
                onClick={() => onChange(page - 1)}
            >
                <ChevronLeft size={17} />
            </button>

            <span>
                Page {page + 1} of {pages}
            </span>

            <button
                className="icon"
                disabled={page >= pages - 1}
                onClick={() => onChange(page + 1)}
            >
                <ChevronRight size={17} />
            </button>
        </div>
    );
}
