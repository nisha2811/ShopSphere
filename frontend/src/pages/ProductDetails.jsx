import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/http';
import { ShoppingBag, Heart, Check, RefreshCw, Star, Truck } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((r) => setP(r.data))
      .catch((e) => setError(e.response?.data?.message || 'Product not found'));
    api.get(`/products/${id}/reviews`).then((r) => setReviews(r.data)).catch(() => {});
    if (user) api.get('/wishlist').then((r) => setLiked(r.data.some((item) => item.product.id === id))).catch(() => {});
  }, [id, user]);

  if (error) {
    return (
      <div className="container empty">
        <h3>Unable to load product</h3>
        <p>{error}</p>
        <button className="cta" onClick={() => window.location.reload()}>
          <RefreshCw size={16} /> Try again
        </button>
      </div>
    );
  }

  if (!p) return <div className="container loading">Loading...</div>;

  const price = Number(p.discountPrice != null && Number(p.discountPrice) < Number(p.price) ? p.discountPrice : p.price);

  const add = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    try {
      await api.post('/cart/items', { productId: id, quantity: qty });
      toast.success('Added to cart');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Please sign in first');
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    try {
      if (liked) await api.delete(`/wishlist/${id}`);
      else await api.post(`/wishlist/${id}`);
      setLiked(!liked);
      toast.success(liked ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (e) { toast.error(e.response?.data?.message || 'Please sign in first'); }
  };

  const averageRating = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  const submitReview = async (event) => {
    event.preventDefault();
    if (!user) { navigate('/login', { state: { from: `/products/${id}` } }); return; }
    setReviewing(true);
    try { const response = await api.post(`/products/${id}/reviews`, { rating: reviewRating, comment: reviewComment }); setReviews((old) => [response.data, ...old]); setReviewComment(''); toast.success('Thank you for rating this product'); } catch (requestError) { toast.error(requestError.response?.data?.message || 'Unable to submit rating'); } finally { setReviewing(false); }
  };

  return (
    <div className="container detail">
      <div className="detail-img">
        <img
          src={p.imageUrl || '/products-lamp.svg'}
          onError={(e) => { e.currentTarget.src = '/products-lamp.svg'; }}
          alt={p.name}
        />
      </div>

      <div className="detail-info">
       <span className="eyebrow">{p.brand}</span>
        <h2>{p.name}</h2>
        <p>{p.description}</p>
        <div className="product-highlights"><span><Truck size={16}/> Expected delivery: {new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span><span><Check size={16}/> Carefully packed and quality checked</span></div>
        <div className="rating-summary"><span className="stars">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={17} fill={star <= Math.round(averageRating) ? 'currentColor' : 'none'}/> )}</span><strong>{averageRating ? averageRating.toFixed(1) : 'New'}</strong><span>{reviews.length} customer rating{reviews.length === 1 ? '' : 's'}</span></div>
        <div className="price">₹{price.toLocaleString('en-IN')}</div>

        <div className="stock">
          <Check size={16} />
          {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : 'Out of stock'}
        </div>

        <div className="buy">
          <input
            type="number"
            min="1"
            max={p.stockQuantity}
            value={qty}
            onChange={(e) => {
              const value = Number(e.target.value);
              setQty(Math.min(p.stockQuantity || 1, Math.max(1, value)));
            }}
          />

          <button
            className="cta big"
            disabled={!p.stockQuantity}
            onClick={add}
          >
            <ShoppingBag size={18} /> Add to cart
          </button>

          <button className={`icon large ${liked ? 'liked' : ''}`} title="Wishlist" onClick={toggleWishlist}>
            <Heart fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
      <section className="review-section"><div className="section-title"><h3>Customer ratings</h3><span className="muted">Share your experience</span></div><form className="review-form" onSubmit={submitReview}><div className="review-stars-input">{[1, 2, 3, 4, 5].map((star) => <button type="button" key={star} className="star-button" onClick={() => setReviewRating(star)} title={`${star} stars`}><Star size={19} fill={star <= reviewRating ? 'currentColor' : 'none'}/></button>)}</div><textarea
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      value={reviewComment}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      onChange={(event) => setReviewComment(event.target.value)}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      placeholder={
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        user
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          ? 'Tell other shoppers what you think...'
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          : 'Sign in to leave a rating'
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      disabled={!user}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    />

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    {user ? (
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      <button
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        className="cta"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        disabled={reviewing}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      >
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        {reviewing ? 'Saving...' : 'Submit rating and review'}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      </button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ) : (
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      <button
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        type="button"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        className="cta"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        onClick={() =>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          navigate('/login', {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            state: { from: `/products/${id}` },
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          })
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      >
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        Sign in to rate
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      </button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    )}</form>{reviews.length ? reviews.map((review) => <article className="review" key={review.id}><div className="stars">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={14} fill={star <= review.rating ? 'currentColor' : 'none'}/>)}</div><p>{review.comment || 'A great choice.'}</p><small>Verified customer</small></article>) : <p className="muted">No ratings yet. Be the first to review this product.</p>}</section>
    </div>
  );
}
