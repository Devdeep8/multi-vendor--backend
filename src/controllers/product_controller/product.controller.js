const { v4: uuidv4 } = require('uuid');
const db = require('../../../config/database');
const { Product, ProductVariant, Inventory , Category , Subcategory} = db; // Make sure Inventory is imported
require('dotenv').config();

const FRONTEND_URL = 'http://localhost:3000';

exports.createFullProductWithVariants = async (req, res) => {
  try {
    const productRaw = req.body.product;
    const summaryRaw = req.body.summary;
    const variantsRaw = req.body.variants;

    const product = typeof productRaw === 'string' ? JSON.parse(productRaw) : productRaw;
    const summary = typeof summaryRaw === 'string' ? JSON.parse(summaryRaw) : summaryRaw;
    const variants = typeof variantsRaw === 'string' ? JSON.parse(variantsRaw) : variantsRaw;

    const files = req.files || [];

    console.log("FILES RECEIVED:", files.map(f => ({ fieldname: f.fieldname, filename: f.filename })));

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

    const shareableLink = `${FRONTEND_URL}/product/${newProduct.slug}`;
    await newProduct.update({ shareable_link: shareableLink });

    const createdVariants = [];

    const allImageUrls = files.map(file => `ProductPhotos/${file.filename}`);

    for (const variant of variants) {
      const variantId = uuidv4();
      const imageUrls = allImageUrls;

      console.log(`Saving variant: ${variant.size} ${variant.color} with images:`, imageUrls);

      const createdVariant = await ProductVariant.create({
        id: variantId,
        product_id: newProduct.id,
        size: variant.size,
        color: variant.color,
        additional_price: variant.additional_price || 0,
        sku: variant.sku,
        image_url: imageUrls,
      });

      // Add Inventory record with initial stock = 10
      await Inventory.create({
        id: uuidv4(),
        product_variant_id: createdVariant.id,
        stock: 10,
      });

      createdVariants.push(createdVariant) ;
    }

    return res.status(201).json({
      success: true,
      message: 'Product with variants and inventory created successfully.',
      product: newProduct,
      variants: createdVariants,
      shareable_link: shareableLink,
    });
  } catch (error) {
    console.error('Error creating product with variants:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getFullProductWithVariantsWithId = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const product = await Product.findOne({
      where: { id: productId },
      include: [
        {
          model: ProductVariant,
          as: 'variants',
          include: [
            {
              model: Inventory,
              attributes: ['stock'],
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Calculate total stock from all variants
    const totalStock = product.variants.reduce((total, variant) => {
      const stock = variant.Inventory?.stock || 0;
      return total + stock;
    }, 0);


    return res.status(200).json({
      success: true,
      product,
      totalStock,
    });
  } catch (error) {
    console.error('Error fetching product with variants:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


// controllers/productController.js
exports.getAllProductsWithVariants = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: ProductVariant,
          include: [
            {
              model: Inventory,
              attributes: ['stock'],
            },
          ],
        },
        {
          model: Category,
          attributes: ['name', 'slug'],
        },
        {
          model: Subcategory,
          attributes: ['name', 'slug'],
        },
      ],
    });

    const formatted = products.map((product) => {
      return {
        id: product.id,
        name: product.name,
        price: product.base_price,
        originalPrice: product.original_price,
        discount: product.discount_percentage,
        rating: product.rating,
        slug: product.slug,
        category: product.Category,
        subcategory: product.Subcategory,
        // You can choose to show only first image, or all variant images
        image_url: product.ProductVariants[0]?.image_url || null,
        variants: product.ProductVariants.map((variant) => ({
          color: variant.color,
          size: variant.size,
          image_url: variant.image_url,
          stock: variant.Inventory?.stock || 0,
        })),
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Error fetching products with variants:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
