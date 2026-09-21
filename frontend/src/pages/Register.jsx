import React, { useMemo, useState } from 'react';
import { Check, Eye, EyeOff, Lock, Mail, Phone, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/http';
import { toast } from 'sonner';
import { Auth } from './Login';

export default function Register() {
  const navigate = useNavigate(); 
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '', address: '' }); 
  const [errors, setErrors] = useState({}); 
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirm, setShowConfirm] = useState(false); 
  const [loading, setLoading] = useState(false); 
  const strength = useMemo(() => { 
        let score = 0; 
        if (form.password.length >= 8) 
            score++; 
        if (/[A-Z]/.test(form.password)) 
            score++; 
        if (/[a-z]/.test(form.password)) 
            score++; 
        if (/\d/.test(form.password)) 
            score++; 
        if (/[^A-Za-z\d]/.test(form.password)) 
            score++; 
        return score; 
    }, [form.password]);
  const update = (key, value) => { 
    setForm((old) => ({ ...old, [key]: value })); 
    setErrors((old) => ({ ...old, [key]: '' })); };
  const validate = () => { 
    const next = {}; 
    if (!form.firstName.trim()) 
        next.firstName = 'First name is required'; 
    if (!form.lastName.trim()) 
        next.lastName = 'Last name is required'; 
    if (!/^\S+@\S+\.\S+$/.test(form.email)) 
        next.email = 'Enter a valid email address'; 
    if (!form.phone.trim()) {
      next.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(form.phone)) {
      next.phone = 'Enter a valid 10-digit phone number';
    }
    if (strength < 5) 
        next.password = 'Use 8+ characters with upper, lower, number and special character'; 
    if (strength < 5) 
        next.confirmPassword = 'Use 8+ characters with upper, lower, number and special character'; 
    if (form.password !== form.confirmPassword) 
        next.confirmPassword = 'Passwords do not match'; 
    setErrors(next); 
    return !Object.keys(next).length; 
};
  const submit = async (event) => { 
    event.preventDefault(); 
    if (!validate()) return; 
    setLoading(true);
    try {
        const response = await api.post('/auth/register', form);
        const result = response.data.data;
        toast.success(result.message || 'Registration successful');
        navigate('/login');
    } 
    catch (error) { 
        const data = error.response?.data; 
        const message = data?.errors ? Object.values(data.errors).join(' ') : data?.message || 'Registration failed'; 
        setErrors({ form: message }); 
        toast.error(message); 
    } 
    finally { 
    setLoading(false); 
    } 
    };
    return (
      <Auth title="Create your account" sub="Join the ShopSphere collection.">
        <form onSubmit={submit} noValidate>
          <div className="register-grid">
            <Field
              icon={<UserRound size={16} />}
              label="First name"
              value={form.firstName}
              error={errors.firstName}
              onChange={(value) => update('firstName', value)}
            />
            <Field
              icon={<UserRound size={16} />}
              label="Last name"
              value={form.lastName}
              error={errors.lastName}
              onChange={(value) => update('lastName', value)}
            />
            <Field
              icon={<Mail size={16} />}
              label="Email"
              type="email"
              value={form.email}
              error={errors.email}
              onChange={(value) => update('email', value)}
            />
            <Field
              icon={<Phone size={16} />}
              label="Phone"
              value={form.phone}
              error={errors.phone}
              onChange={(value) => update('phone', value)}
            />
            <PasswordField
              label="Password"
              value={form.password}
              visible={showPassword}
              toggle={() => setShowPassword(!showPassword)}
              error={errors.password}
              onChange={(value) => update('password', value)}
            />
            <PasswordField
              label="Confirm password"
              value={form.confirmPassword}
              visible={showConfirm}
              toggle={() => setShowConfirm(!showConfirm)}
              error={errors.confirmPassword}
              onChange={(value) => update('confirmPassword', value)}
            />
          </div>

          <div className="password-strength" aria-label="Password strength">
            <div className={`strength-bars strength-${strength}`}>
              {[1, 2, 3, 4, 5].map((bar) => <span key={bar} />)}
            </div>
            <small>
              {strength === 5
                ? 'Strong password'
                : strength > 2
                ? 'Keep going: add the missing requirements'
                : 'Use 8+ characters with upper, lower, number and special character'}
            </small>
          </div>

          {errors.confirmPassword === '' && form.confirmPassword && (
            <p
              className={`match-message ${
                form.password === form.confirmPassword ? 'match' : 'mismatch'
              }`}
            >
              {form.password === form.confirmPassword ? (
                <>
                  <Check size={14} /> Passwords match
                </>
              ) : (
                'Passwords do not match'
              )}
            </p>
          )}

          {errors.form && <p className="error-text">{errors.form}</p>}

          <button className="cta full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-foot">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </Auth>
    );
    }

    // Field component
    function Field({ icon, label, type = 'text', value, error, onChange }) {
      return (
        <label className="input-field">
          <span>
            {icon}
            {label}
          </span>
          <input
            className={error ? 'field-error' : ''}
            required={label !== 'Phone'}
            type={type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
          {error && <small className="error-text">{error}</small>}
        </label>
      );
    }

    // PasswordField component
    function PasswordField({ label, value, visible, toggle, error, onChange }) {
      return (
        <label className="input-field">
          <span>
            <Lock size={16} />
            {label}
          </span>
          <div className="password-input">
            <input
              className={error ? 'field-error' : ''}
              required
              type={visible ? 'text' : 'password'}
              value={value}
              onChange={(event) => onChange(event.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={toggle}
              title={visible ? 'Hide password' : 'Show password'}
            >
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <small className="error-text">{error}</small>}
        </label>
      );
    }
