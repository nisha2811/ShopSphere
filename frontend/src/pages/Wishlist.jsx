
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Trash2 } from 'lucide-react';
import api from '../api/http';
import { toast } from 'sonner';

export default function Wishlist() {
  const [items, setItems] = useState(null);

  const load = async () => {
    try {
      const response = await api.get('/wishlist');

      const wishlistItems = response.data;

      const itemsWithRatings = await Promise.all(
        wishlistItems.map(async (item) => {
          const product = item.product;

          try {
            const reviewsResponse = await api.get(
              `/products/${product.id}/reviews`
            );

            const reviews = reviewsResponse.data;

            const averageRating = reviews.length
              ? reviews.reduce(
                  (sum, review) => sum + Number(review.rating || 0),
                  0
                ) / reviews.length
              : 0;

            return {
              ...item,
              product: {
                ...product,
                averageRating,
                reviewCount: reviews.length,
              },
            };
          } catch {
            return {
              ...item,
              product: {
                ...product,
                averageRating: 0,
                reviewCount: 0,
              },
            };
          }
        })
      );

      setItems(itemsWithRatings);
    } catch (error) {
      console.error('Wishlist loading error:', error);

      toast.error(
        error.response?.data?.message ||
          'Unable to load wishlist'
      );

      setItems([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    try {
      await api.delete(`/wishlist/${id}`);

      setItems((old) =>
        old.filter((item) => item.product.id !== id)
      );

      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Unable to remove item'
      );
    }
  };

  if (!items) {
    return (
      <div className="container loading">
        Loading wishlist...
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page head">
        <div>
          <span className="eyebrow">SAVED ITEMS</span>

          <h2>Your wishlist</h2>

          <p>
            Products you want to come back to.
          </p>
        </div>
      </div>

      {!items.length ? (
        <div className="empty">
          <Heart size={35} />

          <h3>Your wishlist is empty</h3>

          <Link
            className="cta"
            to="/products"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid">
          {items.map((item) => {
            const p = item.product;

            const averageRating = Number(
              p.averageRating ?? 0
            );

            const reviewCount = Number(
              p.reviewCount ?? 0
            );

            return (
              <div
                className="product"
                key={item.id}
              >
                <Link to={`/products/${p.id}`}>
                  <div className="product-img">
                    <img
                      src={
                        p.imageUrl ||
                        '/products-lamp.svg'
                      }
                      alt={p.name}
                    />
                  </div>

                  <div className="product-meta">
                    <div>
                      <span>
                        <b>{p.brand}</b>
                      </span>

                      <h3>{p.name}</h3>
                    </div>

                    <strong>
                      ₹
                      {Number(
                        p.discountPrice ?? p.price
                      ).toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <div className="card-rating">
                    <span className="stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          size={13}
                          key={star}
                          fill={
                            star <=
                            Math.round(averageRating)
                              ? 'currentColor'
                              : 'none'
                          }
                        />
                      ))}
                    </span>

                    <span>
                      {reviewCount > 0
                        ? `${averageRating.toFixed(
                            1
                          )} · ${reviewCount} rating${
                            reviewCount === 1
                              ? ''
                              : 's'
                          }`
                        : 'No ratings yet'}
                    </span>
                  </div>
                </Link>

                <button
                  className="wishlist-remove"
                  type="button"
                  onClick={() => remove(p.id)}
                >
                  <Trash2 size={15} />
                  <span>Remove</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}