import { body, validationResult } from 'express-validator';

function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation error', errors: errors.array() });
    }
    next();
}

const productCategories = ['tshirt', 'hoodie', 'cargo', 'oversized', 'kurti', 'dress', 'shorts', 'jacket', 'shirt', 'joggers', 'accessory', 'other'];
const productGenders = ['male', 'female', 'unisex'];
const fashionStyles = ['streetwear', 'casual', 'formal', 'korean', 'minimal', 'oldmoney', 'bohemian', 'sporty', ''];
const fashionFits = ['slim', 'regular', 'oversized', 'relaxed', 'tailored', ''];
const fashionAesthetics = ['soft', 'clean', 'y2k', 'anime', 'techwear', 'vintage', 'grunge', 'preppy', ''];
const fashionOccasions = ['daily', 'date', 'party', 'work', 'travel', 'lounge', 'wedding', 'festival', ''];
const fashionPatterns = ['solid', 'striped', 'checked', 'printed', 'embroidered', 'graphic', 'floral', 'abstract', ''];
const fashionSeasons = ['summer', 'winter', 'monsoon', 'spring', 'allseason', ''];
const sleeveTypes = ['full', 'half', 'sleeveless', 'threequarter', 'rolledup', ''];
const neckTypes = ['round', 'vneck', 'collar', 'hoodie', 'turtleneck', 'henley', 'mandarin', ''];
const fabrics = ['cotton', 'polyester', 'linen', 'denim', 'silk', 'wool', 'fleece', 'blend', ''];
const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

const createProductValidators = [
    body('title').isString().trim().notEmpty().withMessage('title is required'),
    body('description').optional().isString().trim(),
    body('shortDescription').optional().isString().trim().isLength({ max: 200 }),
    
    // Pricing
    body('priceAmount').notEmpty().withMessage('priceAmount is required').isNumeric(),
    body('priceCurrency').optional().isIn(['USD', 'INR']).withMessage('priceCurrency must be USD or INR'),
    body('discountPercentage').optional().isNumeric(),

    // Type
    body('gender').notEmpty().isIn(productGenders).withMessage('Valid gender is required'),
    body('category').notEmpty().isIn(productCategories).withMessage('Valid category is required'),
    body('subCategory').optional().isString(),

    // Matching
    body('pairGroupId').optional().isString(),

    // Fashion
    body('color').optional().isString(),
    body('secondaryColor').optional().isString(),
    body('style').optional().isIn(fashionStyles),
    body('fit').optional().isIn(fashionFits),
    body('aesthetic').optional().isIn(fashionAesthetics),
    body('occasion').optional().isIn(fashionOccasions),
    body('pattern').optional().isIn(fashionPatterns),
    body('season').optional().isIn(fashionSeasons),
    body('sleeveType').optional().isIn(sleeveTypes),
    body('neckType').optional().isIn(neckTypes),
    body('fabric').optional().isIn(fabrics),

    // Business
    body('brand').optional().isString(),
    body('sizes').optional().isArray(),
    body('sizes.*').optional().isIn(sizes),
    body('stock').optional().isNumeric(),
    body('sku').optional().isString(),
    body('isFeatured').optional().isBoolean(),
    body('isTrending').optional().isBoolean(),

    // Search
    body('tags').optional().isArray(),
    body('tags.*').optional().isString(),
    body('searchKeywords').optional().isArray(),
    body('searchKeywords.*').optional().isString(),

    handleValidationErrors
];

const updateProductValidators = [
    body('title').optional().isString().trim().notEmpty(),
    body('description').optional().isString().trim(),
    body('shortDescription').optional().isString().trim().isLength({ max: 200 }),
    
    body('priceAmount').optional().isNumeric(),
    body('priceCurrency').optional().isIn(['USD', 'INR']),
    body('discountPercentage').optional().isNumeric(),

    body('gender').optional().isIn(productGenders),
    body('category').optional().isIn(productCategories),
    body('subCategory').optional().isString(),

    body('pairGroupId').optional().isString(),

    body('color').optional().isString(),
    body('secondaryColor').optional().isString(),
    body('style').optional().isIn(fashionStyles),
    body('fit').optional().isIn(fashionFits),
    body('aesthetic').optional().isIn(fashionAesthetics),
    body('occasion').optional().isIn(fashionOccasions),
    body('pattern').optional().isIn(fashionPatterns),
    body('season').optional().isIn(fashionSeasons),
    body('sleeveType').optional().isIn(sleeveTypes),
    body('neckType').optional().isIn(neckTypes),
    body('fabric').optional().isIn(fabrics),

    body('brand').optional().isString(),
    body('sizes').optional().isArray(),
    body('sizes.*').optional().isIn(sizes),
    body('stock').optional().isNumeric(),
    body('sku').optional().isString(),
    body('isFeatured').optional().isBoolean(),
    body('isTrending').optional().isBoolean(),
    body('isActive').optional().isBoolean(),

    body('tags').optional().isArray(),
    body('tags.*').optional().isString(),
    body('searchKeywords').optional().isArray(),
    body('searchKeywords.*').optional().isString(),

    handleValidationErrors
];

export { createProductValidators, updateProductValidators };
