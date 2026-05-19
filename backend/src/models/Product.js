import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true },
    type:        { type: String, required: true, enum: ['Couple Set', 'Matching Set', 'Duo Pack', 'Accessory'] },
    description: { type: String, default: '' },
    price:       { type: Number, required: true },
    compareAt:   { type: Number, default: null },
    currency:    { type: String, default: 'USD' },

    // Product images
    images: [{ type: String }],

    // Sizing & variants
    sizes: [{ type: String }],
    colors: [{
      name: { type: String },
      hex:  { type: String },
    }],

    // Garment category for live try-on overlay
    garmentMeta: {
      category: { type: String, enum: ['top', 'bottom', 'full-body', 'accessory'], default: 'top' },
    },

    isActive:   { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 });
productSchema.index({ type: 1, isActive: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
