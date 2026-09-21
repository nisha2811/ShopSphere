import React from 'react';
import { CheckCircle2, Clock3, MapPin, Package, Truck } from 'lucide-react';

const steps = [
  ['Order confirmed', 'Your order is accepted and prepared for processing.'],
  ['Packed', 'Products are checked and securely packed for dispatch.'],
  ['Shipped', 'The package is handed to the delivery partner.'],
  ['Out for delivery', 'The delivery partner is on the way to your address.'],
  ['Delivered', 'Your order reaches the delivery address provided at checkout.'],
];

export default function ShippingDelivery() {
  return (
    <section className="info-page shipping-page">
      <div className="info-hero shipping-hero">
        <div>
          <span className="info-eyebrow"><Truck size={16} /> SHIPPING & DELIVERY</span>
          <h1>From our store to your doorstep.</h1>
          <p>Clear delivery information for your ShopSphere orders, from confirmation through final delivery.</p>
        </div>
        <div className="shipping-hero-art" aria-hidden="true">
          <Package size={88} strokeWidth={1.2} />
          <div className="shipping-orbit orbit-one" />
          <div className="shipping-orbit orbit-two" />
        </div>
      </div>

      <div className="delivery-cards">
        <article className="delivery-card">
          <Clock3 size={24} />
          <h3>Processing</h3>
          <p>Orders are processed after successful confirmation. Processing time can vary by product availability.</p>
        </article>
        <article className="delivery-card">
          <Truck size={24} />
          <h3>Shipping</h3>
          <p>Once dispatched, your order moves through the delivery network to the address provided at checkout.</p>
        </article>
        <article className="delivery-card">
          <MapPin size={24} />
          <h3>Delivery</h3>
          <p>Delivery timing depends on the destination, carrier route, product availability, and service conditions.</p>
        </article>
      </div>

      <section className="shipping-section">
        <div className="section-kicker">HOW IT WORKS</div>
        <h2>Track the journey of your order.</h2>
        <div className="delivery-timeline">
          {steps.map(([title, description], index) => (
            <div className="delivery-step" key={title}>
              <div className="delivery-step-icon">
                {index === steps.length - 1 ? <CheckCircle2 size={19} /> : <span>{index + 1}</span>}
              </div>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="shipping-grid">
        <article className="shipping-panel">
          <div className="panel-icon"><Package size={21} /></div>
          <h2>Delivery information</h2>
          <ul>
            <li>Make sure your delivery address and contact number are correct before placing an order.</li>
            <li>Delivery estimates can change because of weekends, public holidays, carrier delays, weather, or other service conditions.</li>
            <li>Some locations may require additional delivery time.</li>
            <li>If tracking information is available, it can be used to follow the shipment after dispatch.</li>
          </ul>
        </article>

        <article className="shipping-panel">
          <div className="panel-icon"><MapPin size={21} /></div>
          <h2>Delivery address</h2>
          <ul>
            <li>Review your address carefully during checkout.</li>
            <li>Once an order has shipped, an address change may not be possible.</li>
            <li>If delivery cannot be completed, the carrier may make another attempt or return the package according to its process.</li>
            <li>Contact support promptly if your tracking status needs attention.</li>
          </ul>
        </article>
      </section>

      <div className="shipping-note">
        <strong>Need help with an order?</strong>
        <span>Have your order number ready and contact ShopSphere support.</span>
        <a href="mailto:support@shopsphere.local">support@shopsphere.local</a>
      </div>
    </section>
  );
}
