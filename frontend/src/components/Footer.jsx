import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';

export default function Footer()
{
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-column footer-brand">
          <Link to="/" className="footer-logo">
            <span className="footer-mark">S</span>
            <span>ShopSphere</span>
          </Link>

          <p className="footer-description">
            A modern e-commerce platform designed to make online shopping simple, secure, and convenient.
          </p>
        </div>

        <div className="footer-column">
          <h3>Shop</h3>

          <Link to="/products">
            All Products
          </Link>

          <Link to="/products">
            Categories
          </Link>
        </div>

        <div className="footer-column">
          <h3>Account</h3>

          <Link to="/login">
            Sign In
          </Link>

          <Link to="/profile">
            My Profile
          </Link>
        </div>

        <div className="footer-column">
          <h3>Support</h3>

          <Link to="/faq">
            FAQs
          </Link>

          <Link to="/shipping-delivery">
            Shipping & Delivery
          </Link>
        </div>

        <div className="footer-column footer-contact">
          <h3>Get in Touch</h3>

          <div className="contact-item">
            <Mail size={16} />
            <span>support@shopsphere.local</span>
          </div>

          <div className="contact-item">
            <Phone size={16} />
            <span>+91 12345 67890</span>
          </div>

          <div className="contact-item">
            <MapPin size={16} />
            <span>Pune, Maharashtra, India</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>
            © {new Date().getFullYear()} ShopSphere. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
