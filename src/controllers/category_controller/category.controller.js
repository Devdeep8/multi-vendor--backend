const db = require("../../../config/database");
const Category = db.Category;
const Subcategory = db.Subcategory;
const { Product, ProductVariant, Inventory } = db;

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: "Name and slug are required" });
    }

    const category = await Category.create({
      name: name.trim(),
      slug: slug.trim(),
      description: description?.trim() || null,
    });

    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;

    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    await category.update({
      name: name?.trim() || category.name,
      slug: slug?.trim() || category.slug,
      description: description?.trim() || category.description,
    });

    res.status(200).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    await category.destroy(); // Ensure cascade is set on DB for subcategories/products

    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all categories with subcategories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: { model: Subcategory },
      order: [["name", "ASC"]],
    });

    res.status(200).json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create subcategory
exports.createSubcategory = async (req, res) => {
  try {
    const { name, slug, category_id, description } = req.body;

    if (!name || !slug || !category_id) {
      return res.status(400).json({
        success: false,
        message: "Name, slug, and category_id are required",
      });
    }

    const subcategory = await Subcategory.create({
      name: name.trim(),
      slug: slug.trim(),
      category_id,
      description: description?.trim() || null,
    });

    res.status(201).json({ success: true, subcategory });
  } catch (err) {
    console.error("Create Subcategory Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update subcategory
exports.updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, category_id } = req.body;

    const subcategory = await Subcategory.findByPk(id);
    if (!subcategory) return res.status(404).json({ success: false, message: "Subcategory not found" });

    await subcategory.update({
      name: name?.trim() || subcategory.name,
      slug: slug?.trim() || subcategory.slug,
      description: description?.trim() || subcategory.description,
      category_id: category_id || subcategory.category_id,
    });

    res.status(200).json({ success: true, subcategory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete subcategory
exports.deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;

    const subcategory = await Subcategory.findByPk(id);
    if (!subcategory) return res.status(404).json({ success: false, message: "Subcategory not found" });

    await subcategory.destroy(); // cascade should handle child records

    res.status(200).json({ success: true, message: "Subcategory deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get products by category or subcategory slug
exports.getProductsByCategoryOrSubcategorySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug is required",
      });
    }

    const subcategory = await Subcategory.findOne({ where: { slug } });
    let whereClause = {};

    if (subcategory) {
      whereClause.subcategory_id = subcategory.id;
    } else {
      const category = await Category.findOne({ where: { slug } });

      if (category) {
        whereClause.category_id = category.id;
      } else {
        return res.status(404).json({
          success: false,
          message: "No category or subcategory found with the given slug",
        });
      }
    }

    const products = await Product.findAll({
      where: whereClause,
      include: [
        {
          model: ProductVariant,
          include: [
            {
              model: Inventory,
              attributes: ["stock"],
            },
          ],
        },
        {
          model: Category,
          attributes: ["name", "slug"],
        },
        {
          model: Subcategory,
          attributes: ["name", "slug"],
        },
      ],
    });

    const formatted = products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.base_price,
      originalPrice: product.original_price,
      discount: product.discount_percentage,
      rating: product.rating,
      slug: product.slug,
      category: product.Category,
      subcategory: product.Subcategory,
      image_url: product.ProductVariants[0]?.image_url || null,
      variants: product.ProductVariants.map((variant) => ({
        color: variant.color,
        size: variant.size,
        image_url: variant.image_url,
        stock: variant.Inventory?.stock || 0,
      })),
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Error fetching products by category/subcategory slug:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
