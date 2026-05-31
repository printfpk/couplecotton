import productModel from '../models/product.model.js';
import { uploadImage } from '../services/imagekit.service.js';
import mongoose from 'mongoose';
import { getPartnerRecommendations } from '../services/recommendation.service.js';


async function createProduct(req, res) {
    try {
        const productData = req.body;
        const seller = req.user.id; // Extract seller from authenticated user

        // Format price
        productData.price = {
            amount: Number(productData.priceAmount),
            currency: productData.priceCurrency || 'INR',
            discountPercentage: Number(productData.discountPercentage) || 0
        };

        // Format fashion and business objects if they came flattened or parsed
        // The validator ensures the fields exist at top level if sent as form data, 
        // so we map them to the nested structure.
        productData.fashion = {
            color: productData.color,
            secondaryColor: productData.secondaryColor,
            style: productData.style,
            fit: productData.fit,
            aesthetic: productData.aesthetic,
            occasion: productData.occasion,
            pattern: productData.pattern,
            season: productData.season,
            sleeveType: productData.sleeveType,
            neckType: productData.neckType,
            fabric: productData.fabric
        };

        productData.business = {
            brand: productData.brand,
            sizes: productData.sizes,
            stock: Number(productData.stock) || 0,
            isFeatured: productData.isFeatured === 'true' || productData.isFeatured === true,
            isTrending: productData.isTrending === 'true' || productData.isTrending === true
        };
        
        if (productData.sku && productData.sku.trim() !== '') {
            productData.business.sku = productData.sku.trim();
        }
        
        // Auto-generate slug if not provided (fallback)
        if (!productData.slug) {
            productData.slug = productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
        }

        const images = await Promise.all((req.files || []).map(file => uploadImage({ buffer: file.buffer })));

        const product = await productModel.create({ 
            ...productData,
            seller, 
            images 
        });

        return res.status(201).json({
            message: 'Product created',
            data: product,
        });
    } catch (err) {
        console.error('Create product error', err);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Duplicate field error (slug or sku already exists)' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
}


async function getProducts(req, res) {
    try {
        const { 
            q, minprice, maxprice, 
            gender, category, color, style, fit, aesthetic, occasion, brand,
            trending, featured,
            skip = 0, limit = 20,
            sort = 'newest' 
        } = req.query;

        const filter = { isActive: true };

        if (q) filter.$text = { $search: q };
        if (gender) filter.gender = gender;
        if (category) filter.category = category;
        
        if (color) filter['fashion.color'] = color;
        if (style) filter['fashion.style'] = style;
        if (fit) filter['fashion.fit'] = fit;
        if (aesthetic) filter['fashion.aesthetic'] = aesthetic;
        if (occasion) filter['fashion.occasion'] = occasion;
        
        if (brand) filter['business.brand'] = brand;
        if (trending) filter['business.isTrending'] = trending === 'true';
        if (featured) filter['business.isFeatured'] = featured === 'true';

        if (minprice || maxprice) {
            filter['price.amount'] = {};
            if (minprice) filter['price.amount'].$gte = Number(minprice);
            if (maxprice) filter['price.amount'].$lte = Number(maxprice);
        }

        // Sorting
        let sortOption = { createdAt: -1 };
        if (sort === 'price_asc') sortOption = { 'price.finalPrice': 1 };
        if (sort === 'price_desc') sortOption = { 'price.finalPrice': -1 };
        if (sort === 'rating') sortOption = { 'business.rating': -1 };
        if (sort === 'sales') sortOption = { 'business.totalSales': -1 };

        const products = await productModel.find(filter)
            .sort(sortOption)
            .skip(Number(skip))
            .limit(Math.min(Number(limit), 50));
            
        const total = await productModel.countDocuments(filter);

        return res.status(200).json({ data: products, total, skip: Number(skip), limit: Number(limit) });
    } catch (err) {
        console.error('Get products error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


async function getProductById(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product id' });
        }

        const product = await productModel.findOne({ _id: id, isActive: true }).populate('seller', 'username fullName');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ data: product });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function getProductBySlug(req, res) {
    try {
        const { slug } = req.params;

        const product = await productModel.findOne({ slug, isActive: true }).populate('seller', 'username fullName');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ data: product });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}


async function updateProduct(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product id' });
        }

        const product = await productModel.findOne({ _id: id });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Sellers can only update their own, Admins can update any (handled by routes or simple check here)
        if (req.user.role !== 'admin' && product.seller?.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You can only update your own products' });
        }

        const updates = req.body;
        
        // Re-construct nested objects if flat structure is sent
        if (updates.priceAmount !== undefined) {
            product.price = product.price || {};
            product.price.amount = Number(updates.priceAmount);
            if (updates.priceCurrency) product.price.currency = updates.priceCurrency;
            if (updates.discountPercentage !== undefined) product.price.discountPercentage = Number(updates.discountPercentage);
        }

        const fashionFields = ['color', 'secondaryColor', 'style', 'fit', 'aesthetic', 'occasion', 'pattern', 'season', 'sleeveType', 'neckType', 'fabric'];
        fashionFields.forEach(field => {
            if (updates[field] !== undefined) {
                product.fashion = product.fashion || {};
                product.fashion[field] = updates[field];
            }
        });

        const businessFields = ['brand', 'sizes', 'stock', 'sku', 'isFeatured', 'isTrending'];
        businessFields.forEach(field => {
            if (updates[field] !== undefined) {
                product.business = product.business || {};
                if (field === 'isFeatured' || field === 'isTrending') {
                    product.business[field] = updates[field] === 'true' || updates[field] === true;
                } else if (field === 'stock') {
                    product.business[field] = Number(updates[field]);
                } else if (field === 'sku' && typeof updates[field] === 'string' && updates[field].trim() === '') {
                    product.business.sku = undefined;
                } else {
                    product.business[field] = updates[field];
                }
            }
        });

        const rootFields = ['title', 'slug', 'description', 'shortDescription', 'gender', 'category', 'subCategory', 'pairGroupId', 'tags', 'searchKeywords', 'isActive', 'clothImage'];
        rootFields.forEach(field => {
            if (updates[field] !== undefined) {
                product[field] = updates[field];
            }
        });
        
        // Handle new image uploads if any
        if (req.files && req.files.length > 0) {
            const newImages = await Promise.all(req.files.map(file => uploadImage({ buffer: file.buffer })));
            product.images = [...product.images, ...newImages];
        }

        await product.save();
        return res.status(200).json({ message: 'Product updated', product });
    } catch (err) {
        console.error('Update product error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function deleteProduct(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product id' });
        }

        const product = await productModel.findOne({ _id: id });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (req.user.role !== 'admin' && product.seller?.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You can only delete your own products' });
        }

        // Soft delete
        product.isActive = false;
        await product.save();
        
        return res.status(200).json({ message: 'Product deleted (soft)' });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function getProductsBySeller(req, res) {
    try {
        const seller = req.user;
        const { skip = 0, limit = 20 } = req.query;

        const products = await productModel.find({ seller: seller.id, isActive: true })
            .skip(Number(skip))
            .limit(Math.min(Number(limit), 50));

        return res.status(200).json({ data: products });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function getRecommendations(req, res) {
    try {
        const { id } = req.params;
        const { limit = 10 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product id' });
        }

        const { sourceProduct, recommendations } = await getPartnerRecommendations(id, Number(limit));

        return res.status(200).json({
            sourceProduct: {
                _id: sourceProduct._id,
                title: sourceProduct.title,
                gender: sourceProduct.gender,
                category: sourceProduct.category,
            },
            recommendations: recommendations.map(r => ({
                product: r.product,
                score: r.score,
                reasons: r.reasons,
            })),
        });
    } catch (err) {
        console.error('Get recommendations error', err);
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
}

export { 
    createProduct, 
    getProducts, 
    getProductById, 
    getProductBySlug,
    updateProduct, 
    deleteProduct, 
    getProductsBySeller,
    getRecommendations
};
