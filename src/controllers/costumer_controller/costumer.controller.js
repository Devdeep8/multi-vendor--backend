const db = require("../../../config/database");
const Product = db.Product;
const ProductVariant = db.ProductVariant;
const Review = db.ProductReview;
const Category = db.Category;
const Subcategory = db.Subcategory;

exports.getNewArrivals = async (req, res) => {
  try {
    const products = await Product.findAll({
      limit: 10,  
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: ProductVariant,
          attributes: ['image_url'], // image_url is a JSON array (stored as string)
        },
        {
          model: Review,
          attributes: ['rating'],
        },
      ],
    });

    const formatted = products.map(product => {
      const totalReviews = product.Reviews.length;
      const avgRating =
        totalReviews > 0
          ? (
              product.Reviews.reduce((sum, review) => sum + review.rating, 0) /
              totalReviews
            ).toFixed(1)
          : null;

      // Get the first image from the first variant's image_url array
      let image = '/images/default.png'; // fallback

      const firstVariant = product.ProductVariants?.[0];
      if (firstVariant?.image_url) {
        try {
          const images = JSON.parse(firstVariant.image_url);
          if (Array.isArray(images) && images.length > 0) {
            image = images[0];
          }
        } catch (err) {
          console.warn('Invalid image_url JSON:', err);
        }
      }

      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        image,
        price: product.base_price,
        rating: avgRating ? parseFloat(avgRating) : 0,
        reviews: totalReviews,
        discount: product.discount_percentage,
      };
    });


    res.status(200).json({
      success: true,
      message: 'New arrival products fetched successfully.',
      data: formatted,
    });
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch new arrival products. Please try again later.',
      error: error.message,
    });
  }
};

exports.getProductBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const product = await Product.findOne({
      where: { slug },
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
      include: [
        {
          model: ProductVariant,
          attributes: ['id', 'color', 'size', 'additional_price', 'image_url'],
        },
        {
          model: Review,
          attributes: ['id', 'user_id', 'rating', 'review_text', 'created_at'],
        },
        {
          model: Category,
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: Subcategory,
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Format reviews
    const reviews = (product.Reviews || []).map(review => ({
      rating: review.rating,
      comment: review.review_text || '',
      date: new Date(review.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      }),
      verified: true,
    }));

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : 0;

    // Collect colors, sizes, images and formatted variants
    const colorsSet = new Set();
    const sizesSet = new Set();
    const imagesSet = new Set();

    const variants = product.ProductVariants.map(variant => {
      if (variant.color) colorsSet.add(variant.color);
      if (variant.size) sizesSet.add(variant.size);

      let parsedImages = [];
      if (variant.image_url) {
        try {
          const imgs = JSON.parse(variant.image_url);
          if (Array.isArray(imgs)) {
            imgs.forEach(img => imagesSet.add(img));
            parsedImages = imgs;
          }
        } catch (e) {
          console.warn('Invalid image_url JSON in variant:', e);
        }
      }

      return {
        id: variant.id,
        color: variant.color,
        size: variant.size,
        images: parsedImages,
        additionalPrice: parseFloat(variant.additional_price || 0),
      };
    });

    const colors = Array.from(colorsSet).map(name => ({ name }));
    const sizes = Array.from(sizesSet);
    const images = Array.from(imagesSet);

    const formattedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      base_price: parseFloat(product.base_price),
      originalPrice: product.base_price ? parseFloat(product.base_price) : null,
      description: product.description,
      rating: parseFloat(avgRating),
      images,
      colors,
      sizes,
      variants,
      reviews,

      // 👇 Add raw category & subcategory IDs
      category_id: product.category_id || (product.Category?.id ?? null),
      subcategory_id: product.subcategory_id || (product.Subcategory?.id ?? null),

      // 👇 Add full category and subcategory details
      category: product.Category ? {
        id: product.Category.id,
        name: product.Category.name,
        slug: product.Category.slug,
      } : null,

      subcategory: product.Subcategory ? {
        id: product.Subcategory.id,
        name: product.Subcategory.name,
        slug: product.Subcategory.slug,
      } : null,
    };

    res.status(200).json({
      success: true,
      message: 'Product fetched successfully.',
      data: formattedProduct,
    });
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product. Please try again later.',
      error: error.message,
    });
  }
};

