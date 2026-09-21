import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from './api/http';
import { saveAuth, clearAuth } from './store';
import { Toaster } from 'sonner';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';

import Login from './pages/Login';
import Register from './pages/Register';
import Forgot from './pages/Forgot';
import Reset from './pages/Reset';
import Verify from './pages/Verify';

import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import Profile from './pages/Profile';

import Admin from './pages/Admin';
import AdminOrders from './pages/AdminOrders';
import AdminCustomers from './pages/AdminCustomers';

import FAQ from './pages/FAQ';
import ShippingDelivery from './pages/ShippingDelivery';


/**
 * Protects routes that require authentication.
 *
 * If the user is not authenticated, they are redirected to login.
 *
 * If a role is supplied, the authenticated user must have that role.
 */
function ProtectedRoute({ children, role }) {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}


/**
 * Prevents authenticated users from opening pages such as
 * Login and Register.
 */
function PublicOnlyRoute({ children }) {
  const user = useSelector((state) => state.auth.user);

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}


export default function App() {
  const [dark, setDark] = useState(
    localStorage.getItem('shopsphere_theme') === 'dark'
  );

  const [authReady, setAuthReady] = useState(false);

  const user = useSelector((state) => state.auth.user);


  /**
   * Theme handling
   */
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';

    localStorage.setItem(
      'shopsphere_theme',
      dark ? 'dark' : 'light'
    );
  }, [dark]);


  /**
   * Restore authentication from the refresh-token cookie.
   *
   * The refresh token should be HttpOnly, so JavaScript should
   * never read it directly.
   */
  useEffect(() => {
    let mounted = true;

    const restoreAuthentication = async () => {
      try {
        const response = await api.post('/auth/refresh');

        const data = response.data?.data;

        if (data?.accessToken && data?.user) {
          saveAuth(data.user, data.accessToken);
        } else {
          clearAuth();
        }
      } catch (error) {
        clearAuth();
      } finally {
        if (mounted) {
          setAuthReady(true);
        }
      }
    };

    restoreAuthentication();

    return () => {
      mounted = false;
    };
  }, []);


  /**
   * Prevent the application from rendering routes before
   * authentication restoration has completed.
   */
  if (!authReady) {
    return (
      <div className="app-loading">
        Loading ShopSphere...
      </div>
    );
  }


  return (
    <>
      <Navbar
        dark={dark}
        setDark={setDark}
      />

      <main>
        <Routes>

          {/* =========================
              PUBLIC ROUTES
          ========================== */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/products/:id"
            element={<ProductDetails />}
          />

          <Route
            path="/faq"
            element={<FAQ />}
          />

          <Route
            path="/shipping-delivery"
            element={<ShippingDelivery />}
          />

          <Route
            path="/forgot-password"
            element={<Forgot />}
          />

          <Route
            path="/reset-password"
            element={<Reset />}
          />

          <Route
            path="/verify-email"
            element={<Verify />}
          />


          {/* =========================
              AUTHENTICATION ROUTES
          ========================== */}

          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />


          {/* =========================
              CUSTOMER ROUTES
          ========================== */}

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />


          {/* =========================
              ADMIN ROUTES
          ========================== */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminCustomers />
              </ProtectedRoute>
            }
          />


          {/* =========================
              INVALID / UNKNOWN ROUTES
          ========================== */}

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </main>

      <Footer />

      <Toaster position="top-right" />
    </>
  );
}