import React, { useEffect, useState } from 'react';
import { ImagePlus, Package, Save, Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/http';

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  discountPercent: '',
  brand: '',
  sku: '',
  stockQuantity: 0,
  imageUrl: '',
  categoryId: '',
  active: true
};

const finalPrice = (item) =>
  Number(
    item.discountPrice != null && Number(item.discountPrice) < Number(item.price)
      ? item.discountPrice
      : item.price
  );

export default function Admin()
{
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(emptyProduct);
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try
    {
      const [dashboard, productPage, categoryList] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/products', { params: { size: 50 } }),
        api.get('/categories')
      ]);

      setData(dashboard.data);
      setProducts(productPage.data.content);
      setCategories(categoryList.data);
      setError('');
    }
    catch (requestError)
    {
      setError(requestError.response?.data?.message || requestError.response?.data?.error ||'Unable to load product management');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = (key, value) => {
    setProduct((old) => ({ ...old, [key]: value }));
  };

  const imageSelected = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type))
    {
      toast.error('Only PNG, JPG, and WEBP images are allowed');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024)
    {
      toast.error('Image must be 5 MB or smaller');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxDimension = 1600;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context)
        {
          toast.error('Unable to process the selected image');
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        update('imageUrl', compressed);
        toast.success('Image selected');
      };
      image.onerror = () => toast.error('Unable to process the selected image');
      image.src = String(reader.result);
    };
    reader.onerror = () => toast.error('Unable to read the selected image');
    reader.readAsDataURL(file);
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    try
    {
      const regularPrice = Number(product.price);
      const percent = Number(product.discountPercent || 0);

      const body = {
        ...product,
        price: regularPrice,
        discountPrice:
          percent > 0 && percent < 100
            ? Number((regularPrice * (1 - percent / 100)).toFixed(2))
            : null,
        stockQuantity: Number(product.stockQuantity),
        categoryId: product.categoryId
      };

      delete body.discountPercent;

      if (editing)
      {
        await api.put(`/products/${product.id}`, body);
      }
      else
      {
        await api.post('/products', body);
      }
      toast.success(editing ? 'Product updated' : 'Product created');
      setProduct(emptyProduct);
      setEditing(false);
      await load();
    }
    catch (requestError)
    {
      const validationErrors = requestError.response?.data?.errors;
      if (validationErrors && typeof validationErrors === 'object')
      {
        const messages = Object.values(validationErrors).join(' ');
        toast.error(messages || 'Please check the product details');
      }
      else
      {
        toast.error(requestError.response?.data?.message ||requestError.response?.data?.error ||'Unable to save product');
      }
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm('Hide this product from the shop?')) return;
    try
    {
      await api.delete(`/products/${id}`);
      toast.success('Product removed from shop');
      await load();
    }
    catch (requestError)
    {
      toast.error(requestError.response?.data?.message || 'Unable to remove product');
    }
  };

  const edit = (item) => {
    const regular = Number(item.price);
    const discount = Number(item.discountPrice || regular);

    setEditing(true);
    setProduct({
      ...item,
      discountPercent:
        discount < regular ? Math.round((1 - discount / regular) * 100) : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const visible = products.filter(
    (item) =>
      (!category || item.categoryId === category) &&
      `${item.name} ${item.brand} ${item.sku}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );

  if (error)
  {
    return (
      <div className="container empty">
        <h3>Product management unavailable</h3>
        <p>{error}</p>
        <button className="cta" onClick={load}>
          Try again
        </button>
      </div>
    );
  }

  if (!data)
  {
    return <div className="container loading">Loading product management...</div>;
  }

  return (
    <div className="container admin">
      <div className="page head">
        <div>
          <span className="eyebrow">CONTROL CENTER</span>
          <h2>Product management</h2>
          <p>Create, update, and organize the electronics collection.</p>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <Package />
          <span>Products</span>
          <strong>{data.products}</strong>
        </div>
        <div className="stat">
          <Users />
          <span>Customers</span>
          <strong>{data.users}</strong>
        </div>
      </div>

      <section className="admin-section">
        <div className="section-title">
          <h3>{editing ? 'Edit product' : 'Add product'}</h3>

          {editing && (
            <button
              className="textbtn"
              type="button"
              onClick={() => {
                setEditing(false);
                setProduct(emptyProduct);
              }}
            >
              Cancel edit
            </button>
          )}
        </div>

        <form className="form-panel" onSubmit={saveProduct}>
          <div className="two col">
            <label>
              Name
              <input
                required
                value={product.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </label>

            <label>
              Brand
              <input
                required
                value={product.brand}
                onChange={(e) => update('brand', e.target.value)}
              />
            </label>
          </div>

          <div className="two col">
            <label>
              SKU (Stock Keeping Unit)
              <input
                required
                value={product.sku}
                onChange={(e) => update('sku', e.target.value)}
              />
            </label>

            <label>
              Category
              <select
                required
                value={product.categoryId}
                onChange={(e) => update('categoryId', e.target.value)}
              >
                <option value="">Choose category</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="two col">
            <label>
              Price
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={product.price}
                onChange={(e) => update('price', e.target.value)}
              />
            </label>

            <label>
              Discount (%)
              <input
                type="number"
                min="0"
                max="99"
                step="1"
                value={product.discountPercent || ''}
                onChange={(e) => update('discountPercent', e.target.value)}
              />
            </label>
          </div>

          <div className="two col">
            <label>
              Stock
              <input
                required
                type="number"
                min="0"
                value={product.stockQuantity}
                onChange={(e) => update('stockQuantity', e.target.value)}
              />
            </label>

            <label>
              Product image
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={imageSelected}
              />
              <small className="field-help">
                PNG, JPG, WEBP or SVG · maximum 5 MB
              </small>
            </label>
          </div>

          {product.imageUrl && (
            <div className="admin-image-wrap">
              <img
                className="admin-image-preview"
                src={product.imageUrl}
                alt="Selected product"
              />
              <button
                type="button"
                className="textbtn"
                onClick={() => update('imageUrl', '')}
              >
                Remove selected image
              </button>
            </div>
          )}

          <label>
            Description
            <textarea
              required
              value={product.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </label>

          <button className="cta" type="submit">
            <Save size={16} />
            {editing ? 'Update product' : 'Create product'}
          </button>
        </form>
      </section>

      <section className="admin-section">
        <div className="section-title">
          <h3>Products in shop</h3>
          <span className="muted">
            {visible.length} of {products.length} items
          </span>
        </div>

        <div className="admin-filters">
          <div className="search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products, brand, SKU..."
            />
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-list">
          {visible.map((item) => (
            <div className="admin-row" key={item.id}>
              <div className="product-admin-cell">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" />
                ) : (
                  <ImagePlus size={18} />
                )}

                <span>
                  <strong>{item.name}</strong>
                  <span>
                    {item.brand} · {item.sku} · ₹
                    {finalPrice(item).toLocaleString('en-IN')}
                  </span>
                </span>
              </div>

              <div className="row-actions">
                <button
                  className="textbtn edit-button"
                  type="button"
                  onClick={() => edit(item)}
                >
                  Edit
                </button>

                <button
                  className="textbtn remove-button"
                  type="button"
                  onClick={() => removeProduct(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
