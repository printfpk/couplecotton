import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    // ── Basic Info ──
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    shortDescription: { type: String, default: '' },

    // ── Pricing ──
    price: {
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, enum: ['USD', 'INR'], default: 'INR' },
        discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
        finalPrice: { type: Number }
    },

    // ── Product Type ──
    gender: { type: String, enum: ['male', 'female', 'unisex'], required: true },
    category: { 
        type: String, 
        enum: ['tshirt', 'hoodie', 'cargo', 'oversized', 'kurti', 'dress', 'shorts', 'jacket', 'shirt', 'joggers', 'accessory', 'other'],
        required: true
    },
    subCategory: { type: String, default: '' },

    // ── Couple Matching ──
    pairGroupId: { type: String, trim: true, default: '' },

    // ── Fashion Metadata ──
    fashion: {
        color: { type: String, default: '' },
        secondaryColor: { type: String, default: '' },
        style: { type: String, enum: ['streetwear', 'casual', 'formal', 'korean', 'minimal', 'oldmoney', 'bohemian', 'sporty', ''], default: '' },
        fit: { type: String, enum: ['slim', 'regular', 'oversized', 'relaxed', 'tailored', ''], default: '' },
        aesthetic: { type: String, enum: ['soft', 'clean', 'y2k', 'anime', 'techwear', 'vintage', 'grunge', 'preppy', ''], default: '' },
        occasion: { type: String, enum: ['daily', 'date', 'party', 'work', 'travel', 'lounge', 'wedding', 'festival', ''], default: '' },
        pattern: { type: String, enum: ['solid', 'striped', 'checked', 'printed', 'embroidered', 'graphic', 'floral', 'abstract', ''], default: '' },
        season: { type: String, enum: ['summer', 'winter', 'monsoon', 'spring', 'allseason', ''], default: '' },
        sleeveType: { type: String, enum: ['full', 'half', 'sleeveless', 'threequarter', 'rolledup', ''], default: '' },
        neckType: { type: String, enum: ['round', 'vneck', 'collar', 'hoodie', 'turtleneck', 'henley', 'mandarin', ''], default: '' },
        fabric: { type: String, enum: ['cotton', 'polyester', 'linen', 'denim', 'silk', 'wool', 'fleece', 'blend', ''], default: '' }
    },

    // ── Business Metadata ──
    business: {
        brand: { type: String, default: '' },
        sizes: [{ type: String, enum: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] }],
        stock: { type: Number, default: 0, min: 0 },
        sku: { type: String, sparse: true, unique: true },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        totalSales: { type: Number, default: 0 },
        isFeatured: { type: Boolean, default: false },
        isTrending: { type: Boolean, default: false }
    },

    // ── Media ──
    images: [{
        url: String,
        thumbnail: String,
        id: String
    }],
    clothImage: { type: String, default: '' }, // for AI try-on

    // ── Search & Tags ──
    tags: [{ type: String, trim: true }],
    searchKeywords: [{ type: String, trim: true }],

    // ── Metadata ──
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true
});

// Pre-save hook to calculate finalPrice
productSchema.pre('save', function () {
    if (this.price && this.price.amount != null) {
        const discount = this.price.discountPercentage || 0;
        this.price.finalPrice = this.price.amount * (1 - (discount / 100));
    }
});

// Indexes
productSchema.index({ title: 'text', description: 'text', tags: 'text', searchKeywords: 'text', 'fashion.color': 'text', 'business.brand': 'text' });
productSchema.index({ gender: 1, category: 1, isActive: 1 });
productSchema.index({ pairGroupId: 1 });
productSchema.index({ 'business.isFeatured': 1 });
productSchema.index({ 'business.isTrending': 1 });
// slug index already created by `unique: true` on the field definition

export default mongoose.model('product', productSchema);
