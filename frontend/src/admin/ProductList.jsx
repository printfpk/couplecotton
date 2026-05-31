import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this product?')) {
      try {
        const res = await fetch(`http://localhost:5000/api/admin/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        if (res.ok) {
          setProducts(products.filter(p => p._id !== id));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Products</h1>
        <Link to="/admin/products/new" className="admin-btn-primary">Add Product</Link>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <p style={{ padding: 20 }}>Loading products...</p>
        ) : error ? (
          <p style={{ padding: 20, color: 'red' }}>Error: {error}</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>
                    {product.images && product.images[0] && (
                      <img src={product.images[0].thumbnail || product.images[0].url} alt={product.title} />
                    )}
                  </td>
                  <td>{product.title}</td>
                  <td>{product.category} ({product.gender})</td>
                  <td>{product.price?.amount} {product.price?.currency}</td>
                  <td>{product.business?.stock}</td>
                  <td className="admin-actions">
                    <Link to={`/admin/products/${product._id}/edit`} className="admin-btn-edit">Edit</Link>
                    <button onClick={() => handleDelete(product._id)} className="admin-btn-delete">Delete</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductList;
