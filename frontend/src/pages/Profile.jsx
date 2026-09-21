import React, { useEffect, useState } from 'react';
import api from '../api/http';
import { toast } from 'sonner';

export default function Profile() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/users/me')
      .then((response) => setForm(response.data))
      .catch(() => toast.error('Unable to load your profile'))
      .finally(() => setLoading(false));
  }, []);

  const update = (key, value) =>
    setForm((old) => ({ ...old, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await api.put('/users/me', form);
      setForm(response.data);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container loading">Loading profile...</div>;

  return (
    <div className="container profile-page">
      <div className="page head">
        <div>
          <span className="eyebrow">ACCOUNT</span>
          <h2>Your profile</h2>
          <p>Keep your delivery details up to date.</p>
        </div>
      </div>

      <form className="form-panel" onSubmit={submit}>
        <div className="two col">
          <label>
            First name
            <input
              required
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
            />
          </label>
          <label>
            Last name
            <input
              required
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
            />
          </label>
        </div>

        <label>
          Email
          <input value={form.email} disabled />
        </label>

        <label>
          Phone
          <input
            value={form.phone || ''}
            onChange={(e) => update('phone', e.target.value)}
          />
        </label>

        <label>
          Shipping address
          <textarea
            required
            value={form.address || ''}
            onChange={(e) => update('address', e.target.value)}
          />
        </label>

        <button className="cta" disabled={saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
