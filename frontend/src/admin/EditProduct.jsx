import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProductForm from './ProductForm';

const EditProduct = () => {
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await res.json();
        if (res.ok) {
          setInitialData(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        credentials: 'include'
      });
      
      const data = await res.json();
      if (res.ok) {
        navigate('/admin/products');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div style={{padding: 20}}>Loading product data...</div>;
  if (!initialData) return <div style={{padding: 20}}>Product not found.</div>;

  return (
    <div>
      <div className="admin-header">
        <h1>Edit Product</h1>
      </div>
      <ProductForm initialData={initialData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};

export default EditProduct;
