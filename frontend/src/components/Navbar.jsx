import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { clearAuth } from '../store';
import api from '../api/http';
import {
  Heart,
  LogOut,
  Menu,
  Moon,
  Package,
  ShoppingBag,
  Sun,
  UserRound,
  Users,
  X
} from 'lucide-react';

export default function Navbar({ dark, setDark })
{
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const admin = user?.role === 'ADMIN';
    const closeMobileMenu = () => {
        setMobileOpen(false);
    };
    const goToProfile = () => {
        closeMobileMenu();
        navigate(admin ? '/admin' : '/profile');
    };
//     const logout = () => {
//         clearAuth();
//         closeMobileMenu();
//         navigate('/');
//     };
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            clearAuth();
            navigate('/');
        }
    };

    return (
        <header className="site-header">
            <div className="nav">
                <Link
                  className="brand"
                  to="/"
                  onClick={closeMobileMenu}
                  aria-label="ShopSphere home"
                >
                  <span className="mark">S</span>
                  <span className="brand-text">
                    ShopSphere
                  </span>
                </Link>

                <nav className="desktop-nav">
                  <Link to="/products">
                    Shop
                  </Link>
                  {user && !admin && (
                    <Link to="/orders">
                      Orders
                    </Link>
                  )}
                  {admin && (
                    <>
                      <Link to="/admin">
                        <Package size={15} />
                        Products
                      </Link>

                      <Link to="/admin/orders">
                        <ShoppingBag size={15} />
                        Orders
                      </Link>

                      <Link to="/admin/customers">
                        <Users size={15} />
                        Customers
                      </Link>
                    </>
                  )}
                </nav>

                <div className="desktop-actions">
                  {user ? (
                    <>
                      {!admin && (
                        <>
                          <Link
                            className="nav-icon-button"
                            to="/wishlist"
                            title="Wishlist"
                            aria-label="Wishlist"
                          >
                            <Heart size={18} />
                          </Link>

                          <Link
                            className="nav-icon-button"
                            to="/cart"
                            title="Cart"
                            aria-label="Cart"
                          >
                            <ShoppingBag size={18} />
                          </Link>
                        </>
                      )}

                      <button
                        type="button"
                        className="nav-icon-button"
                        onClick={() => setDark(!dark)}
                        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                        aria-label="Toggle theme"
                      >
                        {dark ? (<Sun size={18} />) : (<Moon size={18} />)}
                      </button>

                      <button
                        type="button"
                        className="profile-button"
                        onClick={goToProfile}
                        title="Open profile"
                      >
                        <UserRound size={16} />
                        <span>{user.firstName}</span>
                      </button>

                      <button
                        type="button"
                        className="nav-icon-button"
                        onClick={logout}
                        title="Sign out"
                        aria-label="Sign out"
                      >
                        <LogOut size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        className="signin-button"
                        to="/login"
                      >
                        Sign in
                      </Link>

                      <Link
                        className="cta nav-cta"
                        to="/register"
                      >
                        Create account
                      </Link>
                    </>
                  )}

                </div>

                <button
                  type="button"
                  className="mobile-menu-button"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
                  aria-expanded={mobileOpen}
                >
                  {mobileOpen ? (
                    <X size={22} />
                  ) : (
                    <Menu size={22} />
                  )}
                </button>

              </div>

          <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>

            <nav className="mobile-nav">

              <Link
                to="/products"
                onClick={closeMobileMenu}
              >
                <ShoppingBag size={17} />
                Shop
              </Link>

              {user && !admin && (
                <>
                  <Link
                    to="/orders"
                    onClick={closeMobileMenu}
                  >
                    <Package size={17} />
                    Orders
                  </Link>

                  <Link
                    to="/wishlist"
                    onClick={closeMobileMenu}
                  >
                    <Heart size={17} />
                    Wishlist
                  </Link>

                  <Link
                    to="/cart"
                    onClick={closeMobileMenu}
                  >
                    <ShoppingBag size={17} />
                    Cart
                  </Link>
                </>
              )}

              {admin && (
                <>
                  <Link
                    to="/admin"
                    onClick={closeMobileMenu}
                  >
                    <Package size={17} />
                    Products
                  </Link>

                  <Link
                    to="/admin/orders"
                    onClick={closeMobileMenu}
                  >
                    <ShoppingBag size={17} />
                    Orders
                  </Link>

                  <Link
                    to="/admin/customers"
                    onClick={closeMobileMenu}
                  >
                    <Users size={17} />
                    Customers
                  </Link>
                </>
              )}

              {user ? (
                <>
                  <button
                    type="button"
                    className="mobile-action"
                    onClick={goToProfile}
                  >
                    <UserRound size={17} />
                    {admin ? 'Admin Profile' : 'My Profile'}
                  </button>

                  <button
                    type="button"
                    className="mobile-action"
                    onClick={() => {
                      setDark(!dark);
                      closeMobileMenu();
                    }}
                  >
                    {dark ? (
                      <Sun size={17} />
                    ) : (
                      <Moon size={17} />
                    )}

                    {dark ? 'Light Mode' : 'Dark Mode'}
                  </button>

                  <button
                    type="button"
                    className="mobile-action mobile-logout"
                    onClick={logout}
                  >
                    <LogOut size={17} />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                  >
                    Sign in
                  </Link>

                  <Link
                    className="mobile-register"
                    to="/register"
                    onClick={closeMobileMenu}
                  >
                    Create account
                  </Link>
                </>
              )}

            </nav>

          </div>
        </header>
      );
  }