const db = require("../../../config/database");
const { Op, fn, col, literal } = require("sequelize");
const moment = require("moment");
const bcrypt = require('bcryptjs');

// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
};

// Get dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    // Get total revenue
    const totalRevenue = await db.OrderItem.sum("price");

    // Get previous period revenue for comparison
    const previousPeriodRevenue =
      (await db.OrderItem.sum("price", {
        where: {
          createdAt: {
            [Op.lt]: moment().subtract(30, "days").toDate(),
          },
        },
      })) || 0;

    // Calculate revenue change
    const revenueChange = calculatePercentageChange(
      totalRevenue,
      previousPeriodRevenue
    );

    // Get total users
    const totalUsers = await db.User.count();

    // Get previous period users
    const previousPeriodUsers = await db.User.count({
      where: {
        created_at: {
          [Op.lt]: moment().subtract(30, "days").toDate(),
        },
      },
    });

    // Calculate users change
    const usersChange = calculatePercentageChange(
      totalUsers,
      previousPeriodUsers
    );

    // Get total orders
    const totalOrders = await db.Order.count();

    // Get previous period orders
    const previousPeriodOrders = await db.Order.count({
      where: {
        createdAt: {
          [Op.lt]: moment().subtract(30, "days").toDate(),
        },
      },
    });

    // Calculate orders change
    const ordersChange = calculatePercentageChange(
      totalOrders,
      previousPeriodOrders
    );

    // Get total products
    const totalProducts = await db.Product.count();

    // Get previous period products
    const previousPeriodProducts = await db.Product.count({
      where: {
        createdAt: {
          [Op.lt]: moment().subtract(30, "days").toDate(),
        },
      },
    });

    // Calculate products change
    const productsChange = calculatePercentageChange(
      totalProducts,
      previousPeriodProducts
    );

    console.log(
      "dashboard is working finr ",
      productsChange,
      totalProducts,
      totalRevenue,
      revenueChange,
      ordersChange,
      totalOrders,
      totalUsers,
      usersChange
    );
    // Return dashboard data
    res.status(200).json({
      totalRevenue: totalRevenue || 0,
      revenueChange: parseFloat(revenueChange.toFixed(2)) || 0,
      totalUsers,
      usersChange: parseFloat(usersChange.toFixed(2)) || 0,
      totalOrders,
      ordersChange: parseFloat(ordersChange.toFixed(2)) || 0,
      totalProducts,
      productsChange: parseFloat(productsChange.toFixed(2)) || 0,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res
      .status(500)
      .json({ message: "Error fetching dashboard data", error: error.message });
  }
};

// Get users data
exports.getUsers = async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: ["id", "name", "email", "role", "created_at", "updated_at"],
      limit: 10,
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

// Get products data
exports.getProducts = async (req, res) => {
  try {
    const products = await db.Product.findAll({
      include: [
        {
          model: db.Seller,
          include: [
            {
              model: db.User,
            },
          ],
        },
        {
          model: db.Category,
          include: [
            {
              model: db.Subcategory,
            },
          ],
        },
        {
          model: db.ProductVariant,
        },
      ],
      limit: 10,
      order: [["created_at", "DESC"]],
    });

    console.log(products, "working");

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

// Get orders data
exports.getOrders = async (req, res) => {
  try {
    const orders = await db.Order.findAll({
      include: [
        {
          model: db.User,
          attributes: ["name", "email"],
        },
        {
          model: db.OrderItem,
          include: [
            {
              model: db.ProductVariant,
              attributes: [
                "id",
                "size",
                "color",
                "additional_price",
                "image_url",
              ],
              include: [
                {
                  model: db.Product,
                  attributes: ["name", "base_price"],
                },
              ],
            },
            {
              model: db.Seller, // Seller info on order item level
              include: [
                {
                  model: db.User,
                  attributes: ["name", "profileImage"],
                },
              ],
            },
          ],
        },
      ],
      limit: 10,
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
};
// Get top sellers
exports.getTopSellers = async (req, res) => {
  try {
    const topSellers = await db.Seller.findAll({
      attributes: [
        "id",
        "store_name",
        // Count total order items (sales) and sum their prices (revenue)
        [
          db.sequelize.fn(
            "COUNT",
            db.sequelize.col("Products.ProductVariants.OrderItems.id")
          ),
          "sales",
        ],
        [
          db.sequelize.fn(
            "SUM",
            db.sequelize.col("Products.ProductVariants.OrderItems.price")
          ),
          "revenue",
        ],
      ],
      include: [
        {
          model: db.User,
          attributes: ["id", "name", "profileImage"],
          where: { role: "seller" }, // only sellers
        },
        {
          model: db.Product,
          attributes: [],
          required: true,
          include: [
            {
              model: db.ProductVariant,
              attributes: [],
              required: true,
              include: [
                {
                  model: db.OrderItem,
                  attributes: [],
                  required: true,
                },
              ],
            },
          ],
        },
      ],
      group: ["Seller.id", "User.id"],
      order: [[db.sequelize.literal("revenue"), "DESC"]],
      limit: 5,
      subQuery: false,
    });

    const formattedSellers = topSellers.map((seller) => {
      const user = seller.User;
      return {
        id: seller.id,
        name: user.name,
        storeName: seller.store_name,
        avatar: user.profileImage || "/images/sellers/default.png",
        revenue: parseFloat(seller.getDataValue("revenue")) || 0,
        sales: parseInt(seller.getDataValue("sales")) || 0,
        trend: "up",
      };
    });

    res.status(200).json(formattedSellers);
  } catch (error) {
    console.error("Error fetching top sellers:", error);
    res
      .status(500)
      .json({ message: "Error fetching top sellers", error: error.message });
  }
};
exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await db.User.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "profileImage",
        "created_at",
        [
          db.sequelize.fn("COUNT", db.sequelize.col("Seller.Products.id")),
          "totalProducts",
        ],
        [
          db.sequelize.fn(
            "COUNT",
            db.sequelize.col("Seller.Products.OrderItems.id")
          ),
          "totalSales",
        ],
        [
          db.sequelize.fn(
            "SUM",
            db.sequelize.col("Seller.Products.OrderItems.price")
          ),
          "revenue",
        ],
      ],
      include: [
        {
          model: db.Seller,
          as: "Seller",
          attributes: ["status", "id"],
          required: true, // only users who have a Seller record
          include: [
            {
              model: db.Product,
              as: "Products",
              attributes: [],
              required: false,
              include: [
                {
                  model: db.OrderItem,
                  as: "OrderItems",
                  attributes: [],
                  required: false,
                },
              ],
            },
          ],
        },
      ],
      group: ["User.id", "Seller.id", "Seller.status"],
      order: [[db.sequelize.literal("revenue"), "DESC"]],
      subQuery: false,
    });

    const formatted = sellers.map((seller) => ({
      id: seller.id,
      name: seller.name,
      email: seller.email,
      status: seller.Seller.status,
      seller_id: seller.Seller.id,
      storeName: `${seller.name}'s Store`,
      avatar: "/images/sellers/default.png",
      revenue: parseFloat(seller.getDataValue("revenue")) || 0,
      totalProducts: parseInt(seller.getDataValue("totalProducts")) || 0,
      totalSales: parseInt(seller.getDataValue("totalSales")) || 0,
      trend: "up",
      created_at: seller.created_at,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res
      .status(500)
      .json({ message: "Error fetching sellers", error: error.message });
  }
};

exports.getSellerById = async (req, res) => {
  const { id } = req.params;

  try {
    const seller = await db.Seller.findOne({
      where: { id },
      include: [
        {
          model: db.User, // Fetch the associated User
          attributes: ["id", "name", "email"], // Limit User fields if necessary
        },
        {
          model: db.Product,
          include: [
            {
              model: db.ProductVariant,
            },
          ],
        },
        {
          model: db.OrderItem,
          include: [
            {
              model: db.Order,
              attributes: ["id", "created_at"], // Replace "status" with valid column names
            },
          ],
        },
      ],
    });

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Calculate total revenue, total orders, and total products
    const totalRevenue = seller.OrderItems.reduce(
      (acc, item) => acc + parseFloat(item.price || 0),
      0
    );
    const totalOrders = new Set(
      seller.OrderItems.map((item) => item.Order?.id)
    ).size;
    const totalProducts = seller.Products.length;

    // Send response
    res.status(200).json({
      id: seller.id,
      name: seller.User.name,
      avatar: "/images/sellers/default.png",
      revenue: totalRevenue,
      totalOrders,
      totalProducts,
      orderItems: seller.OrderItems,
      products: seller.Products,
    });
  } catch (error) {
    console.error("Error fetching seller by ID:", error);
    res
      .status(500)
      .json({ message: "Error fetching seller", error: error.message });
  }
};


exports.getLatestActivities = async (req, res) => {
  try {
    // Recent Orders with User info
    const recentOrders = await db.Order.findAll({
      include: [
        {
          model: db.User,
          attributes: ["id", "name", "profileImage"],
        },
      ],
      limit: 5,
      order: [["created_at", "DESC"]],
    });

    // Recent Products with Seller and Seller's User info
    const recentProducts = await db.Product.findAll({
      include: [
        {
          model: db.Seller,
          include: [
            {
              model: db.User,
              attributes: ["id", "name", "profileImage"],
            },
          ],
        },
      ],
      limit: 5,
      order: [["created_at", "DESC"]],
    });

    // Format activities
    const activities = [
      ...recentOrders.map((order) => ({
        id: `order-${order.id}`,
        user: {
          name: order.User?.name || "Unknown User",
          avatar: order.User?.profileImage || "/images/users/default.png",
          type: "customer",
        },
        action: "Placed an order",
        target: `Order: #${order.id}`,
        type: "order",
        timestamp: moment(order.created_at).format("YYYY-MM-DD HH:mm A"),
      })),
      ...recentProducts.map((product) => ({
        id: `product-${product.id}`,
        user: {
          name: product.Seller?.User?.name || "Unknown Seller",
          avatar:
            product.Seller?.User?.profileImage || "/images/users/default.png",
          type: "seller",
        },
        action: "Added a new product",
        target: `Product: ${product.name}`,
        type: "product",
        timestamp: moment(product.created_at).format("YYYY-MM-DD HH:mm A"),
      })),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    res.status(200).json(activities);
  } catch (error) {
    console.error("Error fetching latest activities:", error);
    res.status(500).json({
      message: "Error fetching latest activities",
      error: error.message,
    });
  }
};

// Get revenue data
exports.getRevenueData = async (req, res) => {
  try {
    // Get daily revenue for the last 7 days
    const daily = [];
    for (let i = 6; i >= 0; i--) {
      const date = moment().subtract(i, "days");
      const revenue =
        (await db.OrderItem.sum("price", {
          where: {
            createdAt: {
              [Op.between]: [
                date.startOf("day").toDate(),
                date.endOf("day").toDate(),
              ],
            },
          },
        })) || 0;

      // Calculate platform fees (assuming 10% fee)
      const fees = revenue * 0.1;

      daily.push({
        date: date.format("YYYY-MM-DD"),
        revenue,
        fees,
      });
    }

    // Get weekly revenue for the last 4 weeks
    const weekly = [];
    for (let i = 3; i >= 0; i--) {
      const startDate = moment().subtract(i, "weeks").startOf("week");
      const endDate = moment().subtract(i, "weeks").endOf("week");

      const revenue =
        (await db.OrderItem.sum("price", {
          where: {
            createdAt: {
              [Op.between]: [startDate.toDate(), endDate.toDate()],
            },
          },
        })) || 0;

      // Calculate platform fees (assuming 10% fee)
      const fees = revenue * 0.1;

      weekly.push({
        date: `Week ${4 - i}`,
        revenue,
        fees,
      });
    }

    // Get monthly revenue for the last 6 months
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const startDate = moment().subtract(i, "months").startOf("month");
      const endDate = moment().subtract(i, "months").endOf("month");

      const revenue =
        (await db.OrderItem.sum("price", {
          where: {
            createdAt: {
              [Op.between]: [startDate.toDate(), endDate.toDate()],
            },
          },
        })) || 0;

      // Calculate platform fees (assuming 10% fee)
      const fees = revenue * 0.1;

      monthly.push({
        date: startDate.format("MMM"),
        revenue,
        fees,
      });
    }

    // console.log(daily , weekly , monthly , "workig fine ")

    res.status(200).json({
      daily,
      weekly,
      monthly,
    });
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    res
      .status(500)
      .json({ message: "Error fetching revenue data", error: error.message });
  }
};

// Get user activity
exports.getUserActivity = async (req, res) => {
  try {
    // Get user activity for the last 7 days
    const userActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = moment().subtract(i, "days");

      // Count active users (users who placed orders or added products)
      const activeUsers = await db.User.count({
        include: [
          {
            model: db.Order,
            required: true,
            where: {
              createdAt: {
                [Op.between]: [
                  date.startOf("day").toDate(),
                  date.endOf("day").toDate(),
                ],
              },
            },
          },
        ],
      });

      userActivity.push({
        date: date.format("YYYY-MM-DD"),
        activeUsers,
      });
    }
    console.log(userActivity, "server test");
    res.status(200).json(userActivity);
  } catch (error) {
    console.error("Error fetching user activity:", error);
    res
      .status(500)
      .json({ message: "Error fetching user activity", error: error.message });
  }
};

// User CRUD operations
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await db.User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Create new user
    const newUser = await db.User.create({
      name,
      email,
      password, // In a real app, this would be hashed
      userType: role || "user",
    });

    // Remove password from response
    const userResponse = newUser.toJSON();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    console.log(userId, req.body);
    const { name, email, role, status } = req.body;

    // Find user
    const user = await db.User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user
    await user.update({
      name: name || user.name,
      email: email || user.email,
      userType: role || user.role,
    });

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(200).json(userResponse);
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find user
    const user = await db.User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user
    await user.destroy();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};

// Product CRUD operations
exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await db.Product.findByPk(productId, {
      include: [
        {
          model: db.Category,
          attributes: ["name"],
          include: [
            {
              model: db.Subcategory,
            },
          ],
        },
        {
          model: db.Seller,
          attributes: ["name", "email"],
          include: [
            {
              model: db.User,
              attributes: ["name", "email"],
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, categoryId, sellerId, stock, status } =
      req.body;

    // Create new product
    const newProduct = await db.Product.create({
      name,
      description,
      price,
      categoryId,
      sellerId,
      stock: stock || 0,
      status: status || "active",
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  console.log(req.body, "check its working or not ");
  const transaction = await db.sequelize.transaction();

  try {
    const productId = req.params.id;
    console.log(productId, "req.params");
    const { product, variants, newImages, removedVariantIds } = req.body;

    // Find existing product with variants
    const existingProduct = await db.Product.findByPk(productId, {
      include: [
        {
          model: db.ProductVariant,
        },
      ],
      transaction,
    });

    console.log(existingProduct, "this is the data we get from it ");
    if (!existingProduct) {
      await transaction.rollback();
      return res.status(404).json({ message: "Product not found" });
    }

    // Update main product
    await existingProduct.update(
      {
        seller_id: product.seller_id || existingProduct.seller_id,
        category_id: product.category_id || existingProduct.category_id,
        subcategory_id:
          product.subcategory_id || existingProduct.subcategory_id,
        name: product.name || existingProduct.name,
        slug: product.slug || existingProduct.slug,
        description: product.description || existingProduct.description,
        brand: product.brand || existingProduct.brand,
        base_price: product.base_price || existingProduct.base_price,
        discount_percentage:
          product.discount_percentage !== undefined
            ? product.discount_percentage
            : existingProduct.discount_percentage,
        status: product.status || existingProduct.status,
      },
      { transaction }
    );

    // Handle removed variants
    if (removedVariantIds && removedVariantIds.length > 0) {
      await db.ProductVariant.destroy({
        where: {
          id: {
            [Op.in]: removedVariantIds,
          },
          product_id: productId,
        },
        transaction,
      });
    }

    // Handle variant updates and creations
    const variantPromises = variants.map(async (variantData) => {
      if (variantData.id) {
        // Update existing variant
        const existingVariant = await db.ProductVariant.findByPk(
          variantData.id,
          { transaction }
        );
        if (existingVariant) {
          return await existingVariant.update(
            {
              size: variantData.size,
              color: variantData.color,
              additional_price: variantData.additional_price || 0,
              sku: variantData.sku,
              image_url: variantData.image_url || existingVariant.image_url,
            },
            { transaction }
          );
        }
      } else {
        // Create new variant
        return await db.ProductVariant.create(
          {
            product_id: productId,
            size: variantData.size,
            color: variantData.color,
            additional_price: variantData.additional_price || 0,
            sku: variantData.sku,
            image_url: variantData.image_url || [],
          },
          { transaction }
        );
      }
    });

    await Promise.all(variantPromises);

    // Handle new image uploads (you'll need to implement file upload logic)
    if (newImages && Object.keys(newImages).length > 0) {
      // This is where you'd handle file uploads to your storage service
      // Example: upload to AWS S3, Cloudinary, etc.
      // Then update the corresponding variants with new image URLs

      for (const [variantKey, files] of Object.entries(newImages)) {
        // Parse variant key (format: "color-size")
        const [color, size] = variantKey.split("-");

        // Find the variant to update
        const variant = await db.ProductVariant.findOne({
          where: {
            product_id: productId,
            color: color,
            size: size,
          },
          transaction,
        });

        if (variant && files.length > 0) {
          // Upload files and get URLs (implement your upload logic here)
          const uploadedUrls = await uploadFiles(files); // You need to implement this

          // Update variant with new image URLs
          const currentImages = variant.image_url || [];
          const updatedImages = [...currentImages, ...uploadedUrls];

          await variant.update(
            {
              image_url: updatedImages,
            },
            { transaction }
          );
        }
      }
    }

    // Fetch updated product with variants
    const updatedProduct = await db.Product.findByPk(productId, {
      include: [
        {
          model: db.ProductVariant,
        },
      ],
      transaction,
    });

    await transaction.commit();

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating product:", error);
    res.status(500).json({
      message: "Error updating product",
      error: error.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the product with its variants
    const product = await db.Product.findByPk(productId, {
      include: [{ model: db.ProductVariant }],
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if any variants are used in order_items
    const variantIds = product.ProductVariants.map((v) => v.id);
    const hasOrderItems = await db.OrderItem.findOne({
      where: {
        product_variant_id: variantIds,
      },
    });

    if (hasOrderItems) {
      return res.status(400).json({
        message:
          "Cannot delete product because it has order items linked to its variants.",
      });
    }

    // Delete all product variants
    await db.ProductVariant.destroy({
      where: { product_id: productId },
    });

    // Delete the product
    await product.destroy();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      message: "Error deleting product",
      error: error.message,
    });
  }
};

// Order operations
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await db.Order.findByPk(orderId, {
      include: [
        {
          model: db.User,
          attributes: ["name", "email"],
        },
        {
          model: db.OrderItem,
          include: [
            {
              model: db.Product,
              attributes: ["name", "price"],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res
      .status(500)
      .json({ message: "Error fetching order", error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    // Find order
    const order = await db.Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status
    await order.update({ status });

    res.status(200).json(order);
  } catch (error) {
    console.error("Error updating order status:", error);
    res
      .status(500)
      .json({ message: "Error updating order status", error: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Find order
    const order = await db.Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Delete order items first
    await db.OrderItem.destroy({ where: { orderId } });

    // Delete order
    await order.destroy();

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res
      .status(500)
      .json({ message: "Error deleting order", error: error.message });
  }
};

// Category operations
exports.getCategories = async (req, res) => {
  try {
    const categories = await db.Category.findAll({
      include: [
        {
          model: db.Product,
          attributes: ["id"],
        },
        {
          model: db.Subcategory,
        },
      ],
    });

    console.log(categories, "server");

    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      productCount: category.Products ? category.Products.length : 0,
      created_at: category.created_at,
      subcategories: category.Subcategories,
    }));

    console.log(formattedCategories);

    res.status(200).json(formattedCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await db.Category.categoriesfindByPk(categoryId, {
      include: [
        {
          model: db.Product,
          attributes: ["id", "name", "price", "status"],
        },
      ],
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res
      .status(500)
      .json({ message: "Error fetching category", error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if category already exists
    const existingCategory = await db.Category.findOne({ where: { name } });
    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "Category with this name already exists" });
    }

    // Create new category
    const newCategory = await db.Category.create({
      name,
      description,
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res
      .status(500)
      .json({ message: "Error creating category", error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    console.log(req.params.id, req.body, "server");
    const categoryId = req.params.id;
    const { name, slug } = req.body;

    // Find category
    const category = await db.Category.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Update category
    await category.update({
      name: name || category.name,
      slug: slug || category.slug,
    });

    res.status(200).json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    res
      .status(500)
      .json({ message: "Error updating category", error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category_id = req.params.id;

    console.log(category_id, "test");
    // Find category
    const category = await db.Category.findByPk(category_id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    console.log(category, "got form the db");

    // Find subcategories
    const subcategories = await db.Subcategory.findAll({
      where: { category_id },
    });

    // Collect subcategory IDs
    const subcategoryIds = subcategories.map((subcat) => subcat.id);

    // Delete all products under this category or its subcategories
    await db.Product.destroy({
      where: {
        [db.Sequelize.Op.or]: [
          { category_id },
          { subcategory_id: subcategoryIds.length > 0 ? subcategoryIds : null },
        ],
      },
    });

    // Delete all subcategories
    await db.Subcategory.destroy({
      where: { category_id },
    });

    // Delete the category
    await category.destroy();

    res
      .status(200)
      .json({ message: "Category and related data deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      message: "Error deleting category",
      error: error.message,
    });
  }
};

// Settings operations
exports.getSettings = async (req, res) => {
  try {
    // In a real app, you would fetch settings from a settings table
    // For now, we'll return mock data
    const settings = {
      siteName: "BAB E-commerce",
      siteDescription: "Your one-stop shop for all your needs",
      logo: "/images/logo.png",
      currency: "USD",
      taxRate: 7.5,
      shippingOptions: [
        { name: "Standard", price: 5.99, days: "3-5 days" },
        { name: "Express", price: 12.99, days: "1-2 days" },
        { name: "Free", price: 0, days: "5-7 days", minOrder: 50 },
      ],
      paymentGateways: [
        { name: "Stripe", enabled: true },
        { name: "PayPal", enabled: true },
        { name: "Bank Transfer", enabled: false },
      ],
      emailSettings: {
        fromEmail: "noreply@babcommerce.com",
        contactEmail: "support@babcommerce.com",
        smtpServer: "smtp.example.com",
        smtpPort: 587,
      },
      socialMedia: {
        facebook: "https://facebook.com/babcommerce",
        twitter: "https://twitter.com/babcommerce",
        instagram: "https://instagram.com/babcommerce",
      },
      policies: {
        privacyPolicy: `# Privacy Policy\n\nLast updated: January 1, 2023\n\n## Introduction\n\nWelcome to BAB E-commerce. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.\n\n## The data we collect about you\n\nPersonal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:\n\n- **Identity Data** includes first name, last name, username or similar identifier, title, date of birth and gender.\n- **Contact Data** includes billing address, delivery address, email address and telephone numbers.\n- **Financial Data** includes bank account and payment card details.\n- **Transaction Data** includes details about payments to and from you and other details of products and services you have purchased from us.\n- **Technical Data** includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.\n- **Profile Data** includes your username and password, purchases or orders made by you, your interests, preferences, feedback and survey responses.\n- **Usage Data** includes information about how you use our website, products and services.\n- **Marketing and Communications Data** includes your preferences in receiving marketing from us and our third parties and your communication preferences.\n\n## How we use your personal data\n\nWe will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:\n\n- Where we need to perform the contract we are about to enter into or have entered into with you.\n- Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.\n- Where we need to comply with a legal obligation.\n\n## Data security\n\nWe have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.\n\n## Your legal rights\n\nUnder certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:\n\n- Request access to your personal data.\n- Request correction of your personal data.\n- Request erasure of your personal data.\n- Object to processing of your personal data.\n- Request restriction of processing your personal data.\n- Request transfer of your personal data.\n- Right to withdraw consent.\n\nIf you wish to exercise any of the rights set out above, please contact us.`,

        refundPolicy: `# Refund Policy\n\nLast updated: January 1, 2023\n\n## Returns\n\nOur policy lasts 30 days. If 30 days have gone by since your purchase, unfortunately we can't offer you a refund or exchange.\n\nTo be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.\n\nSeveral types of goods are exempt from being returned. Perishable goods such as food, flowers, newspapers or magazines cannot be returned. We also do not accept products that are intimate or sanitary goods, hazardous materials, or flammable liquids or gases.\n\n## Refunds\n\nOnce your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.\n\nIf you are approved, then your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment, within a certain amount of days.\n\n## Late or missing refunds\n\nIf you haven't received a refund yet, first check your bank account again. Then contact your credit card company, it may take some time before your refund is officially posted. Next contact your bank. There is often some processing time before a refund is posted. If you've done all of this and you still have not received your refund yet, please contact us.\n\n## Sale items\n\nOnly regular priced items may be refunded, unfortunately sale items cannot be refunded.\n\n## Exchanges\n\nWe only replace items if they are defective or damaged. If you need to exchange it for the same item, send us an email and send your item to the address provided.\n\n## Shipping\n\nTo return your product, you should mail your product to the address provided.\n\nYou will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.\n\nDepending on where you live, the time it may take for your exchanged product to reach you, may vary.`,

        termsAndConditions: `# Terms and Conditions\n\nLast updated: January 1, 2023\n\n## Introduction\n\nThese Website Standard Terms and Conditions written on this webpage shall manage your use of our website, BAB E-commerce accessible at www.babcommerce.com.\n\nThese Terms will be applied fully and affect to your use of this Website. By using this Website, you agreed to accept all terms and conditions written in here. You must not use this Website if you disagree with any of these Website Standard Terms and Conditions.\n\n## Intellectual Property Rights\n\nOther than the content you own, under these Terms, BAB E-commerce and/or its licensors own all the intellectual property rights and materials contained in this Website.\n\nYou are granted limited license only for purposes of viewing the material contained on this Website.\n\n## Restrictions\n\nYou are specifically restricted from all of the following:\n\n- publishing any Website material in any other media;\n- selling, sublicensing and/or otherwise commercializing any Website material;\n- publicly performing and/or showing any Website material;\n- using this Website in any way that is or may be damaging to this Website;\n- using this Website in any way that impacts user access to this Website;\n- using this Website contrary to applicable laws and regulations, or in any way may cause harm to the Website, or to any person or business entity;\n- engaging in any data mining, data harvesting, data extracting or any other similar activity in relation to this Website;\n- using this Website to engage in any advertising or marketing.\n\n## Your Content\n\nIn these Website Standard Terms and Conditions, "Your Content" shall mean any audio, video text, images or other material you choose to display on this Website. By displaying Your Content, you grant BAB E-commerce a non-exclusive, worldwide irrevocable, sub licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.\n\nYour Content must be your own and must not be invading any third-party's rights. BAB E-commerce reserves the right to remove any of Your Content from this Website at any time without notice.\n\n## No warranties\n\nThis Website is provided "as is," with all faults, and BAB E-commerce express no representations or warranties, of any kind related to this Website or the materials contained on this Website. Also, nothing contained on this Website shall be interpreted as advising you.\n\n## Limitation of liability\n\nIn no event shall BAB E-commerce, nor any of its officers, directors and employees, shall be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. BAB E-commerce, including its officers, directors and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.\n\n## Indemnification\n\nYou hereby indemnify to the fullest extent BAB E-commerce from and against any and/or all liabilities, costs, demands, causes of action, damages and expenses arising in any way related to your breach of any of the provisions of these Terms.\n\n## Severability\n\nIf any provision of these Terms is found to be invalid under any applicable law, such provisions shall be deleted without affecting the remaining provisions herein.\n\n## Variation of Terms\n\nBAB E-commerce is permitted to revise these Terms at any time as it sees fit, and by using this Website you are expected to review these Terms on a regular basis.\n\n## Assignment\n\nThe BAB E-commerce is allowed to assign, transfer, and subcontract its rights and/or obligations under these Terms without any notification. However, you are not allowed to assign, transfer, or subcontract any of your rights and/or obligations under these Terms.\n\n## Entire Agreement\n\nThese Terms constitute the entire agreement between BAB E-commerce and you in relation to your use of this Website, and supersede all prior agreements and understandings.`,
      },
    };

    res.status(200).json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res
      .status(500)
      .json({ message: "Error fetching settings", error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    // In a real app, you would update settings in a settings table
    // For now, we'll just return the request body
    const updatedSettings = req.body;

    res.status(200).json({
      message: "Settings updated successfully",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res
      .status(500)
      .json({ message: "Error updating settings", error: error.message });
  }
};

// Reports
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    let start = startDate
      ? new Date(startDate)
      : moment().subtract(30, "days").toDate();
    let end = endDate ? new Date(endDate) : new Date();
    let interval = groupBy || "day";

    let salesData = [];

    if (interval === "day") {
      // Daily sales report
      for (let date = moment(start); date <= moment(end); date.add(1, "day")) {
        const dayStart = date.clone().startOf("day").toDate();
        const dayEnd = date.clone().endOf("day").toDate();

        const sales =
          (await db.Order.sum("total_amount", {
            where: {
              created_at: {
                [Op.between]: [dayStart, dayEnd],
              },
            },
          })) || 0;

        const orderCount = await db.Order.count({
          where: {
            created_at: {
              [Op.between]: [dayStart, dayEnd],
            },
          },
        });

        salesData.push({
          date: date.format("YYYY-MM-DD"),
          sales,
          orderCount,
        });
      }
    } else if (interval === "week") {
      // Weekly sales report
      for (let date = moment(start); date <= moment(end); date.add(1, "week")) {
        const weekStart = date.clone().startOf("week").toDate();
        const weekEnd = date.clone().endOf("week").toDate();

        const sales =
          (await db.Order.sum("total", {
            where: {
              created_at: {
                [Op.between]: [weekStart, weekEnd],
              },
            },
          })) || 0;

        const orderCount = await db.Order.count({
          where: {
            created_at: {
              [Op.between]: [weekStart, weekEnd],
            },
          },
        });

        salesData.push({
          date: `${date.format("YYYY-MM-DD")} to ${moment(weekEnd).format(
            "YYYY-MM-DD"
          )}`,
          sales,
          orderCount,
        });
      }
    } else if (interval === "month") {
      // Monthly sales report
      for (
        let date = moment(start).startOf("month");
        date <= moment(end);
        date.add(1, "month")
      ) {
        const monthStart = date.clone().startOf("month").toDate();
        const monthEnd = date.clone().endOf("month").toDate();

        const sales =
          (await db.Order.sum("total", {
            where: {
              created_at: {
                [Op.between]: [monthStart, monthEnd],
              },
            },
          })) || 0;

        const orderCount = await db.Order.count({
          where: {
            created_at: {
              [Op.between]: [monthStart, monthEnd],
            },
          },
        });

        salesData.push({
          date: date.format("YYYY-MM"),
          sales,
          orderCount,
        });
      }
    }

    console.log(salesData, "working");

    res.status(200).json(salesData);
  } catch (error) {
    console.error("Error generating sales report:", error);
    res
      .status(500)
      .json({ message: "Error generating sales report", error: error.message });
  }
};

exports.getUsersReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    let start = startDate
      ? new Date(startDate)
      : moment().subtract(30, "days").toDate();
    let end = endDate ? new Date(endDate) : new Date();
    let interval = groupBy || "day";

    let usersData = [];

    if (interval === "day") {
      // Daily users report
      for (let date = moment(start); date <= moment(end); date.add(1, "day")) {
        const dayStart = date.clone().startOf("day").toDate();
        const dayEnd = date.clone().endOf("day").toDate();

        const newUsers = await db.User.count({
          where: {
            created_at: {
              [Op.between]: [dayStart, dayEnd],
            },
          },
        });

        usersData.push({
          date: date.format("YYYY-MM-DD"),
          newUsers,
        });
      }
    } else if (interval === "week") {
      // Weekly users report
      for (let date = moment(start); date <= moment(end); date.add(1, "week")) {
        const weekStart = date.clone().startOf("week").toDate();
        const weekEnd = date.clone().endOf("week").toDate();

        const newUsers = await db.User.count({
          where: {
            created_at: {
              [Op.between]: [weekStart, weekEnd],
            },
          },
        });

        usersData.push({
          date: `${date.format("YYYY-MM-DD")} to ${moment(weekEnd).format(
            "YYYY-MM-DD"
          )}`,
          newUsers,
        });
      }
    } else if (interval === "month") {
      // Monthly users report
      for (
        let date = moment(start).startOf("month");
        date <= moment(end);
        date.add(1, "month")
      ) {
        const monthStart = date.clone().startOf("month").toDate();
        const monthEnd = date.clone().endOf("month").toDate();

        const newUsers = await db.User.count({
          where: {
            created_at: {
              [Op.between]: [monthStart, monthEnd],
            },
          },
        });

        usersData.push({
          date: date.format("YYYY-MM"),
          newUsers,
        });
      }
    }

    res.status(200).json(usersData);
  } catch (error) {
    console.error("Error generating users report:", error);
    res
      .status(500)
      .json({ message: "Error generating users report", error: error.message });
  }
};

exports.getProductsReport = async (req, res) => {
  try {
    // 1. Top Selling Products (by OrderItems count)
    const topProducts = await db.Product.findAll({
      attributes: [
        "id",
        "name",
        [fn("COUNT", col("OrderItems.id")), "totalOrders"],
      ],
      include: [
        {
          model: db.OrderItem,
          as: "OrderItems", // Must match alias in association
          attributes: [],
        },
        {
          model: db.Category,
          attributes: ["name"],
        },
        {
          model: db.Subcategory,
          attributes: ["name"],
        },
      ],
      group: ["Product.id", "Category.id", "Subcategory.id"],
      order: [[literal("totalOrders"), "DESC"]],
      limit: 10,
    });

    // 2. Product Count per Category
    const categories = await db.Category.findAll({
      attributes: [
        "id",
        "name",
        [fn("COUNT", col("Products.id")), "productCount"],
      ],
      include: [
        {
          model: db.Product,
          as: "Products", // Must match alias in association
          attributes: [],
        },
      ],
      group: ["Category.id"],
      order: [[literal("productCount"), "DESC"]],
    });

    // 3. Low Stock Products (stock < 10 && > 0)
    const lowStockProducts = await db.Product.findAll({
      include: [
        {
          model: db.ProductVariant,
          include: [
            {
              model: db.Inventory,
              where: {
                stock: {
                  [Op.lt]: 10,
                  [Op.gt]: 0,
                },
              },
              required: true,
            },
          ],
          required: true,
        },
        {
          model: db.Category,
          attributes: ["name"],
        },
      ],
      limit: 10,
      order: [["created_at", "ASC"]],
    });

    // 4. Out of Stock Products (stock = 0)
    const outOfStockProducts = await db.Product.findAll({
      include: [
        {
          model: db.ProductVariant,
          include: [
            {
              model: db.Inventory,
              where: {
                stock: 0,
              },
              required: true,
            },
          ],
          required: true,
        },
        {
          model: db.Category,
          attributes: ["name"],
        },
      ],
      limit: 10,
    });

    return res.status(200).json({
      topProducts,
      categories,
      lowStockProducts,
      outOfStockProducts,
    });
  } catch (error) {
    console.error("Error generating products report:", error);
    return res.status(500).json({
      message: "Error generating products report",
      error: error.message,
    });
  }
};

exports.getTheSellerStatus = async (req, res) => {
  console.log(req.user.id);
  try {
    const seller = await db.Seller.findOne({
      where: {
        user_id: req.user.id,
      },
    });

    res.status(200).json(seller); // this is a single object, not an array
  } catch (error) {
    console.error("Error fetching seller status:", error);
    res.status(500).json({
      message: "Error fetching seller status",
      error: error.message,
    });
  }
};

exports.getPendingSeller = async (req, res) => {
  try {
    const sellers = await db.Seller.findAll({
      where: {
        status: "PENDING",
      },
    });

    res.status(200).json(sellers);
  } catch (error) {
    console.error("Error fetching pending sellers:", error);
    res
      .status(500)
      .json({
        message: "Error fetching pending sellers",
        error: error.message,
      });
  }
};

exports.updateSellerStatus = async (req, res) => {
  console.log(req.body , "checking");
  const { status, seller_id } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const seller = await db.Seller.findByPk(seller_id);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const user = await db.User.findOne({ where: { id: seller.user_id } });
    seller.status = status;
    await seller.save();

    console.log(user , "chck ")

    await db.User.update({ role: "seller" }, { where: { id: user.id } });

    res
      .status(200)
      .json({ message: `Seller status updated to ${status}`, seller });
  } catch (error) {
    console.error("Error updating seller status:", error);
    res.status(500).json({
      message: "Error updating seller status",
      error: error.message,
    });
  }
};



exports.updateProfile = async (req, res) => {
  console.log(req.body);
  try {
    const user = await db.User.findByPk(req.user.id);

    user.name = req.body.name;
    user.phone = req.body.phone;

    // Only update profileImage if a file is uploaded
    if (req.file) {
      user.profileImage = `profileImage/${req.file.filename}`;
    }

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
};



exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user ID from auth token/session
    const userId = req.user.id; // adjust to your auth method
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await db.User.findByPk(userId);
    if (!user || !user.password) {
      return res.status(404).json({ message: "User not found or password not set" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ field: "currentPassword", message: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.User.update(
      { password: hashedPassword },
      { where: { id: userId } }
    );

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password update error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
