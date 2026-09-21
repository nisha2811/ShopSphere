import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/http';
import { toast } from 'sonner';
import { Auth } from './Login';

export default function Forgot()
{
  const [e, setE] = useState('');

  const submit = async (x) => {
    x.preventDefault();
    try
    {
      const r = await api.post('/auth/forgot-password', { email: e });
      toast.success(r.data.data.message);
    }
    catch (x)
    {
      toast.error('Unable to process request');
    }
  };

  return (
    <Auth title="Reset your password" sub="Enter your email and we’ll send a reset link.">
      <form onSubmit={submit}>
        <label>
          Email
          <input
            required
            type="email"
            value={e}
            onChange={(x) => setE(x.target.value)}
          />
        </label>
        <button className="cta full">Send reset link</button>
      </form>
      <p className="auth-foot">
        <Link to="/login">Back to sign in</Link>
      </p>
    </Auth>
  );
}
