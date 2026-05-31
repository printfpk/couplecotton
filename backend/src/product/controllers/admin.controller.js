import productModel from '../models/product.model.js';
import { uploadImage } from '../services/imagekit.service.js';
import mongoose from 'mongoose';

async function adminGetProducts(req, res) {
    try {
        const { skip = 0, limit = 20, q } = req.query;
        const filter = {};

        if (q) {
            filter.$text = { $search: q };
        }

        const products = await productModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(Number(skip))
            .limit(Math.min(Number(limit), 100))
            .populate('seller', 'username fullName');

        const total = await productModel.countDocuments(filter);

        return res.status(200).json({ data: products, total, skip: Number(skip), limit: Number(limit) });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function adminCreateProduct(req, res) {
    try {
        const productData = req.body;
        // Since admin might create products for the platform itself, we might not have a seller 
        // or the admin is the seller.
        const seller = req.user.id; 

        // Format price
        productData.price = {
            amount: Number(productData.priceAmount),
            currency: productData.priceCurrency || 'INR',
            discountPercentage: Number(productData.discountPercentage) || 0
        };

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

        if (!productData.slug) {
            productData.slug = productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
        }

        // Process image links
        let images = [];
        if (productData.imageUrls) {
            images = productData.imageUrls.split(',').map(url => {
                const trimmed = url.trim();
                return { url: trimmed, thumbnail: trimmed, id: trimmed };
            }).filter(img => img.url.length > 0);
        }

        let clothImage = productData.clothImageUrl ? productData.clothImageUrl.trim() : '';

        const product = await productModel.create({ 
            ...productData,
            seller, 
            images,
            clothImage
        });

        return res.status(201).json({
            message: 'Product created',
            data: product,
        });
    } catch (err) {
        console.error('Admin create product error', err);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Duplicate field error (slug or sku already exists)' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function adminUpdateProduct(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product id' });
        }

        const product = await productModel.findById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const updates = req.body;
        
        // Handle flattened fields like in normal update
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

        const rootFields = ['title', 'slug', 'description', 'shortDescription', 'gender', 'category', 'subCategory', 'pairGroupId', 'tags', 'searchKeywords', 'isActive'];
        rootFields.forEach(field => {
            if (updates[field] !== undefined) {
                product[field] = updates[field];
            }
        });

        // Handle image links
        if (updates.imageUrls !== undefined) {
            if (updates.imageUrls.trim() === '') {
                product.images = [];
            } else {
                product.images = updates.imageUrls.split(',').map(url => {
                    const trimmed = url.trim();
                    return { url: trimmed, thumbnail: trimmed, id: trimmed };
                }).filter(img => img.url.length > 0);
            }
        }

        if (updates.clothImageUrl !== undefined) {
            product.clothImage = updates.clothImageUrl.trim();
        }

        await product.save();
        return res.status(200).json({ message: 'Product updated', product });
    } catch (err) {
        console.error('Admin update product error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function adminDeleteProduct(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product id' });
        }

        const product = await productModel.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ message: 'Product permanently deleted' });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export { 
    adminGetProducts, 
    adminCreateProduct, 
    adminUpdateProduct, 
    adminDeleteProduct 
};
