import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProductForm from './ProductForm';

const AddProduct = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData, // FormData doesn't need Content-Type header (browser sets it with boundary)
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
      alert('Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Add New Product</h1>
      </div>
      <ProductForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};

export default AddProduct;
