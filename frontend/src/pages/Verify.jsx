import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/http';

export default function Verify()
{
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying your email…');

  useEffect(() => {
    const token = new URLSearchParams(
      location.hash.replace(/^#/, '')
    ).get('token');

    if (token)
    {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search
      );
    }

    if (!token)
    {
      setMessage('Verification link is invalid or incomplete.');
      return;
    }

    api.post('/auth/verify-email', { token })
      .then((response) => setMessage(response.data.data.message))
      .catch((error) => {
        setMessage(
          error.response?.data?.message || 'Verification failed.'
        );
      });
  }, [location.hash]);

  return (
    <div className="auth">
      <div className="auth-card center">
        <div className="mark">S</div>
        <h2>{message}</h2>
        <button
          className="cta"
          type="button"
          onClick={() => navigate('/login')}
        >
          Continue to sign in
        </button>
      </div>
    </div>
  );
}
