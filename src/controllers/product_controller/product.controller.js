const { v4: uuidv4 } = require('uuid');
const db = require('../../../config/database');
const { Product, ProductVariant } = db;
require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

exports.createFullProductWithVariants = async (req, res) => {
  try {
    // Step 1: Parse incoming form fields
    const productRaw = req.body.product;
    const summaryRaw = req.body.summary;
    const variantsRaw = req.body.variants;

    const product = typeof productRaw === 'string' ? JSON.parse(productRaw) : productRaw;
    const summary = typeof summaryRaw === 'string' ? JSON.parse(summaryRaw) : summaryRaw;
    const variants = typeof variantsRaw === 'string' ? JSON.parse(variantsRaw) : variantsRaw;

    const files = req.files || [];

    console.log("FILES RECEIVED:", files.map(f => ({ fieldname: f.fieldname, filename: f.filename })));

    // Step 2: Create product
    const newProduct = await Product.create({
      id: product.id || uuidv4(),
      name: product.name,
      description: product.description,
      brand: product.brand,
      original_price: product.original_price,
      discount_percentage: product.discount_percentage,
      base_price: product.base_price,
      slug: product.slug,
      seller_id: product.seller_id,
      category_id: product.category_id,
      subcategory_id: product.subcategory_id,
    });

    const shareableLink = `${FRONTEND_URL}/all/product/${newProduct.slug}`;
    await newProduct.update({ shareable_link: shareableLink });

    // Step 3: Create variants
    const createdVariants = [];

    // Prepare all image paths from uploaded files (can be used for all variants or split per variant if needed)
    const allImageUrls = files.map(file => `ProductPhotos/${file.filename}`);

    for (const variant of variants) {
      const variantId = uuidv4();

      // Instead of filtering by fieldname, just assign all uploaded images (or customize as needed)
      const imageUrls = allImageUrls;

      console.log(`Saving variant: ${variant.size} ${variant.color} with images:`, imageUrls);

      const createdVariant = await ProductVariant.create({
        id: variantId,
        product_id: newProduct.id,
        size: variant.size,
        color: variant.color,
        additional_price: variant.additional_price || 0,
        sku: variant.sku,
        image_url: imageUrls, // Save all uploaded images for every variant
      });

      createdVariants.push(createdVariant);
    }

    return res.status(201).json({
      success: true,
      message: 'Product with variants created successfully.',
      product: newProduct,
      variants: createdVariants,
      shareable_link: shareableLink,
    });
  } catch (error) {
    console.error('Error creating product with variants:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
