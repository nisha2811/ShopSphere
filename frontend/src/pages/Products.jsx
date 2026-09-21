
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Star,
  X
} from 'lucide-react';

import api from '../api/http';

const price = (product) =>
  Number(
    product.discountPrice != null &&
    Number(product.discountPrice) < Number(product.price)
      ? product.discountPrice
      : product.price
  );

export default function Products() {

  const [data, setData] = useState({
    content: [],
    totalPages: 0,
    number: 0
  });

  const [searchParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState(
    searchParams.get('category') || ''
  );
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(
    async (
      page = 0,
      searchValue = q,
      categoryValue = category
    ) => {

      setLoading(true);
      setError('');

      try {

        const response = await api.get('/products', {
          params: {
            q: searchValue.trim() || undefined,
            category: categoryValue || undefined,
            page,
            size: 20,
            sort: 'createdAt,desc'
          }
        });

        const products = response.data?.content || [];

        const content = await Promise.all(
          products.map(async (product) => {

            try {

              const reviewsResponse =
                await api.get(
                  `/products/${product.id}/reviews`
                );

              const reviews =
                Array.isArray(reviewsResponse.data)
                  ? reviewsResponse.data
                  : [];

              const averageRating =
                reviews.length > 0
                  ? reviews.reduce(
                      (sum, review) =>
                        sum + Number(review.rating || 0),
                      0
                    ) / reviews.length
                  : 0;

              return {
                ...product,
                averageRating,
                reviewCount: reviews.length
              };

            } catch {

              return {
                ...product,
                averageRating: 0,
                reviewCount: 0
              };
            }
          })
        );

        setData({
          ...response.data,
          content
        });

      } catch (requestError) {

        console.error(
          'Unable to load products:',
          requestError
        );

        setError(
          requestError.response?.data?.message ||
          'Could not load products.'
        );

      } finally {

        setLoading(false);
      }
    },
    [q, category]
  );

  useEffect(() => {

    api
      .get('/categories')
      .then((response) => {

        setCategories(
          Array.isArray(response.data)
            ? response.data
            : []
        );

      })
      .catch((error) => {

        console.error(
          'Unable to load categories:',
          error
        );

        setCategories([]);
      });

  }, []);

  useEffect(() => {

    load(0);

  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategoryChange = (event) => {

    const value = event.target.value;

    setCategory(value);

    load(0, q, value);
  };

  const handleSearch = () => {

    load(0, q, category);
  };

  const clearSearch = () => {

    setQ('');

    load(0, '', category);
  };

  return (
    <div className="container">

      <div className="page head">

        <div>

          <span className="eyebrow">
            THE COLLECTION
          </span>

          <h2>
            Electronics & Gadgets
          </h2>

          <p>
            Discover smartphones, gadgets, audio,
            gaming gear and smart technology.
          </p>

        </div>

        <div className="shop-filters">

          <div className="search">

            <Search size={18} />

            <input
              value={q}
              onChange={(event) =>
                setQ(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder="Search phones, laptops, headphones..."
              aria-label="Search products"
            />

            {q && (
              <button
                type="button"
                className="icon"
                onClick={clearSearch}
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}

          </div>

          <select
            value={category}
            onChange={handleCategoryChange}
            aria-label="Filter by category"
          >

            <option value="">
              All categories
            </option>

            {categories.map((item) => (
              <option
                value={item.id}
                key={item.id}
              >
                {item.name}
              </option>
            ))}

          </select>

          <button
            type="button"
            className="cta"
            onClick={handleSearch}
          >
            <Search size={22} />
            Search
          </button>

        </div>

      </div>
      <br/><br/>

      {loading ? (

        <div className="grid">

          {[1, 2, 3, 4].map((item) => (
            <div
              className="skeleton"
              key={item}
            />
          ))}

        </div>

      ) : error ? (

        <div className="empty">

          <h3>
            Unable to load the collection
          </h3>

          <p>
            {error}
          </p>

          <button
            className="cta"
            onClick={() => load(0)}
          >
            <RefreshCw size={16} />
            Try again
          </button>

        </div>

      ) : data.content?.length ? (

        <>

          <div className="grid">

            {data.content.map((product) => (

              <Link
                className="product"
                to={`/products/${product.id}`}
                key={product.id}
              >

                <div className="product-img">

                  <img
                    src={
                      product.imageUrl ||
                      '/products-lamp.svg'
                    }
                    alt={product.name}
                  />

                </div>

                <div className="product-meta">

                  <div>

                    <span>
                      <b>
                        {product.brand}
                      </b>
                    </span>

                    <h3>
                      {product.name}
                    </h3>

                  </div>

                  <strong>
                    ₹
                    {price(product).toLocaleString(
                      'en-IN'
                    )}
                  </strong>

                </div>

                <div className="card-rating">

                  <span className="stars">

                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <Star
                          size={13}
                          key={star}
                          fill={
                            star <=
                            Math.round(
                              product.averageRating || 0
                            )
                              ? 'currentColor'
                              : 'none'
                          }
                        />
                      )
                    )}

                  </span>

                  <span>

                    {product.reviewCount
                      ? `${product.averageRating.toFixed(
                          1
                        )} · ${
                          product.reviewCount
                        } rating${
                          product.reviewCount === 1
                            ? ''
                            : 's'
                        }`
                      : 'No ratings yet'}

                  </span>

                </div>

                <p>
                  {product.description}
                </p>

              </Link>

            ))}

          </div>

          <Pagination
            page={data.number}
            totalPages={data.totalPages}
            onChange={(nextPage) =>
              load(nextPage)
            }
          />

        </>

      ) : (

        <div className="empty">

          <h3>
            No products found
          </h3>

          <p>
            Try another category or search term.
          </p>

        </div>

      )}

    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange
}) {

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">

      <button
        className="icon"
        disabled={page === 0}
        onClick={() =>
          onChange(page - 1)
        }
        title="Previous page"
      >
        <ChevronLeft size={17} />
      </button>

      <span>
        Page {page + 1} of {totalPages}
      </span>

      <button
        className="icon"
        disabled={
          page >= totalPages - 1
        }
        onClick={() =>
          onChange(page + 1)
        }
        title="Next page"
      >
        <ChevronRight size={17} />
      </button>

    </div>
  );
}