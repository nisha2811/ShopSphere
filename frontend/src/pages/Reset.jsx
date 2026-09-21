import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/http';
import { toast } from 'sonner';
import { Auth } from './Login';

export default function Reset()
{
  const navigate = useNavigate();
  const [form, setForm] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const token = useMemo(() => {
    const value = new URLSearchParams(
      window.location.hash.replace(/^#/, '')
    ).get('token');

    if (value)
    {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search
      );
    }

    return value;
  }, []);

  const submit = async (event) => {
    event.preventDefault();

    if (!token)
    {
      toast.error('This password reset link is invalid or incomplete.');
      return;
    }

    if (form.password.length < 8
        || !/[A-Z]/.test(form.password)
        || !/[a-z]/.test(form.password)
        || !/\d/.test(form.password)
        || !/[^A-Za-z\d]/.test(form.password))
    {
      toast.error('Use 8+ characters with upper, lower, number and special character.');
      return;
    }

    if (form.password !== form.confirmPassword)
    {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);

    try
    {
      await api.post('/auth/reset-password', {
        ...form,
        token
      });

      toast.success('Password updated successfully');
      navigate('/login');
    }
    catch (error)
    {
      toast.error(
        error.response?.data?.message || 'Unable to reset your password'
      );
    }
    finally
    {
      setLoading(false);
    }
  };

  return (
    <Auth
      title="Choose a new password"
      sub="Use a strong password for your account."
    >
      <form onSubmit={submit} noValidate>
        <label className="input-field">
          <span>New password</span>
          <input
            required
            minLength={8}
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((old) => ({
                ...old,
                password: event.target.value
              }))
            }
          />
        </label>

        <label className="input-field">
          <span>Confirm password</span>
          <input
            required
            minLength={8}
            type="password"
            value={form.confirmPassword}
            onChange={(event) =>
              setForm((old) => ({
                ...old,
                confirmPassword: event.target.value
              }))
            }
          />
        </label>

        <button className="cta full" disabled={loading}>
          {loading ? 'Updating password...' : 'Update password'}
        </button>
      </form>
    </Auth>
  );
}
