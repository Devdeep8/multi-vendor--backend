// controllers/seller.controller.js

const { v4: uuidv4 } = require("uuid");
const db = require("../../../config/database");

const Seller = db.Seller; // Import the Seller model from your Sequelize setup
const User = db.User; // Import the User model from your Sequelize setup
const Product = db.Product;
const ProductVariant = db.ProductVariant;
const Inventory = db.Inventory; // Make sure this is imported

// Create new seller

exports.createSeller = async (req, res) => {
  try {
    const {
      user_id,
      store_name,
      store_description,
      status = "approved",
    } = req.body;
    console.log(req.body);

    // Check if seller already exists for this user
    const existingSeller = await Seller.findOne({ where: { user_id } });
    if (existingSeller) {
      return res
        .status(400)
        .json({ message: "Seller already exists for this user." });
    }

    // Create seller
    const seller = await Seller.create({
      user_id,
      store_name,
      store_description,
      status,
    });

    // Update the user role to 'seller' (or whatever role you want)
    await User.update({ role: "seller" }, { where: { id: user_id } });

    return res.status(201).json({
      seller,
      success: true,
      message: "Seller created successfully .",
    });
  } catch (error) {
    console.error("Create Seller Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all sellers
exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.findAll({ include: User });
    res.status(200).json({ sellers });
  } catch (error) {
    console.error("Get Sellers Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get seller by ID
exports.getSellerById = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await Seller.findByPk(id, { include: User });

    if (!seller) return res.status(404).json({ message: "Seller not found" });

    res.status(200).json({ seller });
  } catch (error) {
    console.error("Get Seller Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// get seller with userId

exports.getSellerByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    const seller = await Seller.findOne({
      where: { user_id },
      attributes: ["id"], // Only return seller ID
      include: {
        model: User,
        attributes: ["name"], // Only return user name
      },
    });

    if (!seller) {
      return res
        .status(404)
        .json({ message: "Seller not found for this user ID" });
    }

    // Return clean structured data
    res.status(200).json({
      seller: {
        id: seller.id,
        name: seller.User.name,
      },
    });
  } catch (error) {
    console.error("Get Seller by User ID Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update seller
exports.updateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const seller = await Seller.findByPk(id);
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    await seller.update(updates);
    res.status(200).json({ seller });
  } catch (error) {
    console.error("Update Seller Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete seller
exports.deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await Seller.findByPk(id);
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    await seller.destroy();
    res.status(200).json({ message: "Seller deleted successfully" });
  } catch (error) {
    console.error("Delete Seller Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//get the product by seller id
exports.getProductsBySellerId = async (req, res) => {
  try {
    const { seller_id } = req.params;

    if (!seller_id) {
      return res
        .status(400)
        .json({ success: false, message: "Seller ID is required." });
    }

    // Fetch products with their variants and inventories
    const products = await Product.findAll({
      where: { seller_id },
      include: [
        {
          model: ProductVariant,
          include: [
            {
              model: Inventory,
              attributes: ["stock", "restock_date"],
            },
          ],
        },
      ],
    });

    if (!products || products.length === 0) {
      return res.status(200).json({
        success: true,
        seller_id,
        products: [],
        message: "No products found for this seller.",
      });
    }

    // Format each product and calculate stock
    const formattedProducts = products.map((product) => {
      let totalStock = 0;

      const variants = (product.ProductVariants || []).map((variant) => {
        let parsedImages;
        try {
          parsedImages = JSON.parse(variant.image_url);
        } catch {
          parsedImages = [];
        }

        const stock = variant.Inventory?.stock || 0;
        totalStock += stock;

        return {
          size: variant.size,
          color: variant.color,
          sku: variant.sku,
          additional_price: variant.additional_price,
          stock: stock,
          restock_date: variant.Inventory?.restock_date || null,
          image_url: parsedImages[0] || null,
        };
      });

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        brand: product.brand,
        slug: product.slug,
        base_price: product.base_price,
        discount_percentage: product.discount_percentage,
        original_price: product.original_price,
        shareable_link: product.shareable_link,
        category_id: product.category_id,
        subcategory_id: product.subcategory_id,
        totalStock,
        variants,
      };
    });

    return res.status(200).json({
      success: true,
      seller_id,
      products: formattedProducts,
    });
  } catch (error) {
    console.error("Error fetching products by seller ID:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
