import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../api/http';
import { saveAuth } from '../store';
import { toast } from 'sonner';

export default function Login()
{
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const update = (key, value) => {
    setForm((old) => ({
      ...old,
      [key]: value,
    }));

    setErrors((old) => ({
      ...old,
      [key]: '',
    }));

    setServerError('');
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim())
    {
      next.email = 'Email is required';
    }
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
    {
      next.email = 'Enter a valid email address';
    }
    if (!form.password)
    {
      next.password = 'Password is required';
    }

    setErrors(next);
    return !Object.keys(next).length;
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!validate())
    {
      return;
    }

    setLoading(true);
    try
    {
      const response = await api.post('/auth/login', form);
      saveAuth(response.data.data.user,response.data.data.accessToken);
      toast.success('Welcome back');
      navigate('/');
    }
    catch (error)
    {
      const message = error.response?.data?.message || 'Unable to sign in';
      setServerError(message);
      toast.error(message);
    }
    finally
    {
      setLoading(false);
    }
  };

  return (
    <Auth
      title="Welcome back"
      sub="Sign in to continue to your collection."
    >
      <form onSubmit={submit} noValidate>
        <Field
          icon={<Mail size={16} />}
          label="Email"
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(value) => update('email', value)}
        />

        <PasswordField
          icon={<Lock size={16} />}
          label="Password"
          type="password"
          visible={showPassword} toggle={() => setShowPassword(!showPassword)}
          value={form.password}
          error={errors.password}
          onChange={(value) => update('password', value)}
        />

        {serverError && (
          <p className="error-text" role="alert">
            {serverError}
          </p>
        )}

        <div className="row-end">
          <Link to="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <button
          className="cta full"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="auth-foot">
        New here?{' '}
        <Link to="/register">
          Create an account
        </Link>
      </p>
    </Auth>
  );
}

function Field({
  icon,
  label,
  type,
  value,
  error,
  onChange,
})
{
  return (
    <label className="input-field">
      <span>
        {icon}
        {label}
      </span>

      <input
        className={error ? 'field-error' : ''}
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
      />

      {error && (
        <small className="error-text">
          {error}
        </small>
      )}
    </label>
  );
}

function PasswordField({ label, value, visible, toggle, error, onChange })
{
    return (
        <label className="input-field">
            <span><Lock size={16}/>{label}</span>
            <div className="password-input">
                <input className={error ? 'field-error' : ''} required type={visible ? 'text' : 'password'} value={value} onChange={(event) => onChange(event.target.value)}/>
                <button type="button" className="password-toggle" onClick={toggle} title={visible ? 'Hide password' : 'Show password'}>{visible ?
                    <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
            </div>
            {
                error && <small className="error-text">{error}</small>
            }
        </label>
    );
}

function Auth({ title, sub, children })
{
  return (
    <div className="auth">
      <div className={`auth-card ${title === 'Create your account' ? 'register-card' : ''}`}>
        <div className="brand">
          <span className="mark">S</span>
          ShopSphere
        </div>

        <h2>{title}</h2>

        <p>{sub}</p>

        {children}
      </div>
    </div>
  );
}

export { Auth };