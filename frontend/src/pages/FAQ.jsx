import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';

const faqs = [
  {
    category: 'Orders & Shopping',
    items: [
      ['How do I place an order?', 'Browse the collection, open a product, choose the quantity, add it to your cart, and continue to checkout. You can review your items and total before placing the order.'],
      ['Can I change or cancel my order?', 'If your order has not entered processing or shipping, contact support as soon as possible with your order number. Once an order has shipped, cancellation may no longer be possible.'],
      ['Where can I see my orders?', 'Sign in and open Orders from the navigation menu. You can view your order history and open an individual order to see its status and details.'],
    ],
  },
  {
    category: 'Payments',
    items: [
      ['Which payment methods are supported?', 'Available payment methods are shown during checkout. The final amount and payment status are displayed before the order is confirmed.'],
      ['Why did my payment fail?', 'A payment can fail because of an incorrect payment detail, bank decline, insufficient funds, or a temporary payment-service issue. Check your details and try again.'],
    ],
  },
  {
    category: 'Products',
    items: [
      ['Are product specifications accurate?', 'Product information is displayed from the catalogue maintained by ShopSphere. Always review the product specifications, included items, and compatibility information before ordering.'],
      ['Can I add a product to my wishlist?', 'Yes. Sign in, open the product, and use the wishlist control. Your saved products are available from the Wishlist page.'],
    ],
  },
  {
    category: 'Account & Security',
    items: [
      ['How do I create an account?', 'Select Create account and complete the registration form. Your email address is used for account verification and account-related communication.'],
      ['I forgot my password. What should I do?', 'Use Forgot password on the sign-in page. Follow the password-reset link sent to your registered email address and create a new password.'],
    ],
  },
];

export default function FAQ()
{
  const [open, setOpen] = useState('Orders & Shopping-0');
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLowerCase();
  const filtered = faqs
    .map((group) => ({
      ...group,
      items: group.items.filter(([question, answer]) =>
        !normalized || `${question} ${answer} ${group.category}`.toLowerCase().includes(normalized)
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <section className="info-page faq-page">
      <div className="info-hero">
        <div>
          <span className="info-eyebrow"><HelpCircle size={16} /> SUPPORT CENTRE</span>
          <h1>Frequently asked questions.</h1>
          <p>Quick answers about shopping, orders, payments, products, and your ShopSphere account.</p>
        </div>
      </div>

      <div className="info-search">
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search questions..."
          aria-label="Search frequently asked questions"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="info-empty">
          <HelpCircle size={30} />
          <h2>No matching questions</h2>
          <p>Try another search term or browse all questions.</p>
        </div>
      ) : (
        <div className="faq-groups">
          {filtered.map((group) => (
            <section className="faq-group" key={group.category}>
              <h2>{group.category}</h2>
              <div className="faq-list">
                {group.items.map(([question, answer]) => {
                  const key = `${group.category}-${group.items.indexOf(group.items.find((item) => item[0] === question))}`;
                  const isOpen = open === key;
                  return (
                    <article className={`faq-item ${isOpen ? 'open' : ''}`} key={question}>
                      <button
                        type="button"
                        className="faq-question"
                        onClick={() => setOpen(isOpen ? '' : key)}
                        aria-expanded={isOpen}
                      >
                        <span>{question}</span>
                        <ChevronDown size={19} />
                      </button>
                      {isOpen && <div className="faq-answer"><p>{answer}</p></div>}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
