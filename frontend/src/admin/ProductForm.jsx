import React, { useState, useEffect } from 'react';

const ProductForm = ({ initialData, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    priceAmount: '',
    priceCurrency: 'INR',
    discountPercentage: '',
    gender: 'unisex',
    category: 'tshirt',
    subCategory: '',
    pairGroupId: '',
    color: '',
    style: '',
    fit: '',
    aesthetic: '',
    occasion: '',
    pattern: '',
    season: '',
    fabric: '',
    brand: '',
    sizes: [],
    stock: '',
    sku: '',
    isFeatured: false,
    isTrending: false,
    imageUrls: '',
    clothImageUrl: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        shortDescription: initialData.shortDescription || '',
        priceAmount: initialData.price?.amount || '',
        priceCurrency: initialData.price?.currency || 'INR',
        discountPercentage: initialData.price?.discountPercentage || '',
        gender: initialData.gender || 'unisex',
        category: initialData.category || 'tshirt',
        subCategory: initialData.subCategory || '',
        pairGroupId: initialData.pairGroupId || '',
        color: initialData.fashion?.color || '',
        style: initialData.fashion?.style || '',
        fit: initialData.fashion?.fit || '',
        aesthetic: initialData.fashion?.aesthetic || '',
        occasion: initialData.fashion?.occasion || '',
        pattern: initialData.fashion?.pattern || '',
        season: initialData.fashion?.season || '',
        fabric: initialData.fashion?.fabric || '',
        brand: initialData.business?.brand || '',
        sizes: initialData.business?.sizes || [],
        stock: initialData.business?.stock || '',
        sku: initialData.business?.sku || '',
        isFeatured: initialData.business?.isFeatured || false,
        isTrending: initialData.business?.isTrending || false,
        imageUrls: initialData.images ? initialData.images.map(img => img.url).join(', ') : '',
        clothImageUrl: initialData.clothImage || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSizesChange = (e) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, sizes: options }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    
    // Append all text fields
    Object.keys(formData).forEach(key => {
      if (key === 'sizes') {
        formData.sizes.forEach(size => data.append('sizes[]', size));
      } else {
        data.append(key, formData[key]);
      }
    });

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form-container">
      
      <div className="admin-form-section">
        <h2>Basic Info</h2>
        <div className="admin-form-group">
          <label>Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required className="admin-form-control" />
        </div>
        <div className="admin-form-group">
          <label>Slug (optional, auto-generated)</label>
          <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="admin-form-control" />
        </div>
        <div className="admin-form-group">
          <label>Short Description</label>
          <input type="text" name="shortDescription" value={formData.shortDescription} onChange={handleChange} className="admin-form-control" />
        </div>
        <div className="admin-form-group">
          <label>Full Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="admin-form-control"></textarea>
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Pricing & Stock</h2>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>Price Amount *</label>
            <input type="number" name="priceAmount" value={formData.priceAmount} onChange={handleChange} required className="admin-form-control" />
          </div>
          <div className="admin-form-group">
            <label>Currency</label>
            <select name="priceCurrency" value={formData.priceCurrency} onChange={handleChange} className="admin-form-control">
              <option value="INR">INR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>Discount %</label>
            <input type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleChange} className="admin-form-control" />
          </div>
          <div className="admin-form-group">
            <label>Stock Quantity</label>
            <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="admin-form-control" />
          </div>
        </div>
        <div className="admin-form-group">
          <label>SKU</label>
          <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="admin-form-control" />
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Classification</h2>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>Gender *</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required className="admin-form-control">
              <option value="unisex">Unisex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label>Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} required className="admin-form-control">
              <option value="tshirt">T-Shirt</option>
              <option value="hoodie">Hoodie</option>
              <option value="shirt">Shirt</option>
              <option value="shorts">Shorts</option>
              <option value="dress">Dress</option>
              <option value="cargo">Cargo</option>
              <option value="oversized">Oversized</option>
              <option value="kurti">Kurti</option>
              <option value="jacket">Jacket</option>
              <option value="joggers">Joggers</option>
              <option value="accessory">Accessory</option>
            </select>
          </div>
        </div>
        <div className="admin-form-group">
          <label>Couple Pair Group ID (Used for matching couples)</label>
          <input type="text" name="pairGroupId" value={formData.pairGroupId} onChange={handleChange} placeholder="e.g. classic-polo-01" className="admin-form-control" />
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Fashion Attributes</h2>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>Primary Color</label>
            <input type="text" name="color" value={formData.color} onChange={handleChange} className="admin-form-control" />
          </div>
          <div className="admin-form-group">
            <label>Style</label>
            <select name="style" value={formData.style} onChange={handleChange} className="admin-form-control">
              <option value="">None</option>
              <option value="casual">Casual</option>
              <option value="streetwear">Streetwear</option>
              <option value="formal">Formal</option>
              <option value="korean">Korean</option>
              <option value="minimal">Minimal</option>
              <option value="oldmoney">Old Money</option>
            </select>
          </div>
        </div>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>Aesthetic</label>
            <select name="aesthetic" value={formData.aesthetic} onChange={handleChange} className="admin-form-control">
              <option value="">None</option>
              <option value="clean">Clean</option>
              <option value="soft">Soft</option>
              <option value="y2k">Y2K</option>
              <option value="vintage">Vintage</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label>Season</label>
            <select name="season" value={formData.season} onChange={handleChange} className="admin-form-control">
              <option value="">None</option>
              <option value="summer">Summer</option>
              <option value="winter">Winter</option>
              <option value="monsoon">Monsoon</option>
              <option value="allseason">All Season</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Business & Visibility</h2>
        <div className="admin-form-group">
          <label>Brand</label>
          <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="admin-form-control" />
        </div>
        <div className="admin-form-group">
          <label>Available Sizes</label>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
            {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'].map(size => (
              <label key={size} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  name="sizes" 
                  value={size} 
                  checked={formData.sizes.includes(size)} 
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData(prev => ({
                      ...prev,
                      sizes: checked 
                        ? [...prev.sizes, size] 
                        : prev.sizes.filter(s => s !== size)
                    }));
                  }} 
                />
                {size}
              </label>
            ))}
          </div>
        </div>
        <div className="admin-form-row" style={{ marginTop: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
            Featured Product
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" name="isTrending" checked={formData.isTrending} onChange={handleChange} />
            Trending Product
          </label>
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Media Links</h2>
        <div className="admin-form-group">
          <label>Product Image URLs (Comma separated)</label>
          <textarea name="imageUrls" value={formData.imageUrls} onChange={handleChange} rows="3" placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" className="admin-form-control"></textarea>
        </div>
        <div className="admin-form-group">
          <label>Cloth Image URL (For AI Try-On)</label>
          <input type="text" name="clothImageUrl" value={formData.clothImageUrl} onChange={handleChange} placeholder="https://example.com/cloth.jpg" className="admin-form-control" />
        </div>
      </div>

      <div className="admin-form-actions">
        <button type="submit" disabled={isSubmitting} className="admin-btn-primary">
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
