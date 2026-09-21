import React, { useEffect, useState } from 'react';
import { ArrowRight, BadgeCheck, ChevronRight, Headphones, Laptop, Smartphone, Sparkles, Watch, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/http';

const categoryIcons = {
  Mobiles: Smartphone,
  Tablets: Laptop,
  'Laptops & Computers': Laptop,
  'Audio & Headphones': Headphones,
  'Smartwatches & Wearables': Watch,
  Gaming: Zap
};

const categoryImages = {
  Mobiles: '/products-headphones.svg',
  'Audio & Headphones': '/products-headphones.svg',
  'Computer Accessories': '/products-keyboard.svg',
  'Smart Home': '/tv.jpeg'
};

export default function Home()
{
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories')
      .then((response) => setCategories(response.data.slice(0, 10)))
      .catch(() => setCategories([]));
  }, []);

  return (
    <div className="home">
      <section className="electronics-hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles size={14} />
            THE SMARTER TECH STORE
          </span>

          <h1>
            Technology that
            <span> fits your world.</span>
          </h1>

          <p>
            Discover smartphones, audio, gaming gear, wearables and everyday
            tech essentials — all in one modern shopping experience.
          </p>

          <div className="hero-actions">
            <Link className="cta hero-cta" to="/products">
              Explore gadgets <ArrowRight size={18} />
            </Link>

          </div>

          <div className="hero-benefits">
            <span><BadgeCheck size={16} /> Verified products</span>
            <span><BadgeCheck size={16} /> Secure checkout</span>
            <span><BadgeCheck size={16} /> Tracked delivery</span>
          </div>
        </div>

        <div className="electronics-visual" aria-label="Featured electronics">
          <div className="visual-glow visual-glow-one" />
          <div className="visual-glow visual-glow-two" />

          <div className="tech-card tech-card-main">
            <img src="/tv.jpeg" alt="Smart TV" />
            <div>
              <small>SMART ENTERTAINMENT</small>
              <strong>Upgrade your screen.</strong>
            </div>
          </div>

          <div className="tech-card tech-card-headphones">
            <img src="/products-headphones.svg" alt="Wireless headphones" />
            <span>Audio</span>
          </div>

          <div className="tech-card tech-card-keyboard">
            <img src="/products-keyboard.svg" alt="Mechanical keyboard" />
            <span>Gaming & Work</span>
          </div>

          <div className="visual-badge">
            <Zap size={16} />
            <span>NEW TECH<br /><b>JUST DROPPED</b></span>
          </div>
        </div>
      </section>

      <section className="home-category-section">
        <div className="home-section-heading">
          <div>
            <span className="eyebrow">SHOP BY CATEGORY</span>
            <h2>Find your next gadget</h2>
          </div>
          <Link to="/products" className="home-view-all">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {categories.length > 0 ? (
          <div className="category-strip">
            {categories.map((category) => {
              const Icon = categoryIcons[category.name] || Sparkles;

              return (
                <Link
                  key={category.id}
                  className="category-tile"
                  to={`/products?category=${category.id}`}
                >
                  <div className="category-icon">
                    <Icon size={24} />
                  </div>

                  <div className="category-tile-copy">
                    <strong>{category.name}</strong>
                    <span>{category.description || 'Explore products'}</span>
                  </div>

                  <ChevronRight size={17} />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="category-strip category-placeholder">
            <Link to="/products" className="category-tile">
              <div className="category-icon"><Smartphone size={24} /></div>
              <div className="category-tile-copy">
                <strong>Mobiles</strong>
                <span>Smartphones & mobile devices</span>
              </div>
              <ChevronRight size={17} />
            </Link>

            <Link to="/products" className="category-tile">
              <div className="category-icon"><Headphones size={24} /></div>
              <div className="category-tile-copy">
                <strong>Audio & Headphones</strong>
                <span>Earbuds, headphones & speakers</span>
              </div>
              <ChevronRight size={17} />
            </Link>

            <Link to="/products" className="category-tile">
              <div className="category-icon"><Laptop size={24} /></div>
              <div className="category-tile-copy">
                <strong>Laptops & Computers</strong>
                <span>Power your work and play</span>
              </div>
              <ChevronRight size={17} />
            </Link>
          </div>
        )}
      </section>

      <section className="home-promo">
        <div>
          <span className="eyebrow">WHY SHOPSPHERE</span>
          <h2>Your everyday tech, thoughtfully selected.</h2>
          <p>
            From your next phone to the accessories around it, ShopSphere
            brings the essentials together with a clean, simple experience.
          </p>
        </div>

        <div className="promo-points">
          <div>
            <strong>01</strong>
            <span>Modern electronics collection</span>
          </div>
          <div>
            <strong>02</strong>
            <span>Easy product discovery</span>
          </div>
          <div>
            <strong>03</strong>
            <span>Simple, secure shopping</span>
          </div>
        </div>
      </section>
    </div>
  );
}
