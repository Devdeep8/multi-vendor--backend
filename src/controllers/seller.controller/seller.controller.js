// controllers/seller.controller.js

const db = require("../../../config/database");
const getSellerIdByUserId = require("../../utils/getSellerIdByUserId");
const { Op, fn, col, literal, } = require('sequelize');
const sequelize = require("sequelize");

const Seller = db.Seller; // Import the Seller model from your Sequelize setup
const User = db.User; // Import the User model from your Sequelize setup
const Product = db.Product;
const ProductVariant = db.ProductVariant;
const Inventory = db.Inventory; // Make sure this is imported
const Order = db.Order;
const OrderItem = db.OrderItem
const Payment = db.Payment
const Coupon = db.Coupon;
const CouponRedemption = db.CouponRedemption;
const Category = db.Category
// Create new seller

exports.createSeller = async (req, res) => {
  try {
    const {
      user_id,
      store_name,
      store_description,
      status = "pending",
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
    // await User.update({ role: "seller" }, { where: { id: user_id } });

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

exports.getOrdersBySellerId = async (req, res) => {
  const userId = req.user.id;

  // Get sellerId using your existing method
  const sellerId = await getSellerIdByUserId(userId);

  console.log("Seller ID:", sellerId);
  try {
    // Get orders that include at least one item from this seller
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          where: { seller_id: sellerId }, // ✅ filter here
        },
        {
          model: User,
          attributes: ["name", "email"],
        },
        {
          model: Payment,
          attributes: ["status", ],
        },
      ],
    });

    const formatted = {
      stats: {
        totalOrders: orders.length,
        totalOrdersChange: 0,
        pendingOrders: orders.filter(o => o.order_status === "pending").length,
        pendingOrdersChange: 0,
        completedOrders: orders.filter(o => o.order_status === "delivered").length,
        completedOrdersChange: 0,
        cancelledOrders: orders.filter(o => o.order_status === "cancelled").length,
        cancelledOrdersChange: 0,
      },
      orders: orders.map(order => ({
        id: `${order.id}`,
        customer: {
          name: order.User?.name || "N/A",
          email: order.User?.email || "N/A",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        status: order.order_status,
        date: order.created_at.toISOString().split("T")[0],
        total: Number(order.total_amount),
        items: order.OrderItems.reduce((sum, item) => sum + item.quantity, 0),
        paymentStatus: order.payment_status,
      })),
    };

    return res.json(formatted);
  } catch (err) {
    console.error("Error fetching orders by seller:", err);
    return res.status(500).json({ message: "Failed to fetch seller orders" });
  }
};

exports. getDiscountAnalyticsBySeller = async (req, res) => {
  try {
    const user_id = req.user.id;

    const sellerId = await getSellerIdByUserId(user_id);
     // 1. Fetch all coupons for the seller
    const coupons = await Coupon.findAll({
      where: { seller_id: sellerId },
      raw: true,
    });

    // 2. Fetch all redemptions for the seller's coupons
    const couponIds = coupons.map(c => c.id);

    const redemptions = await CouponRedemption.findAll({
      where: { coupon_id: { [Op.in]: couponIds } },
      raw: true,
    });

    // 3. Calculate stats
    const activeDiscounts = coupons.filter(c => c.status === "active").length;
    const revenueImpact = redemptions.reduce((sum, r) => sum + parseFloat(r.discount_amount), 0);
    const averageDiscount =
      redemptions.length > 0 ? revenueImpact / redemptions.length : 0;

    // You can compute usage by month if you want trends
    const discountUsage = redemptions.length;

    // Optional: You could use a previous period to compute changes like revenueImpactChange, etc.
    const stats = {
      activeDiscounts,
      activeDiscountsChange: 0, // You can plug in comparison logic
      revenueImpact: parseFloat(revenueImpact.toFixed(2)),
      revenueImpactChange: 0,
      averageDiscount: parseFloat(averageDiscount.toFixed(2)),
      averageDiscountChange: 0,
      discountUsage,
      discountUsageChange: 0,
    };

    // 4. Discount performance by month (example: last 4 months)
const performance = await CouponRedemption.findAll({
  attributes: [
    [sequelize.literal(`DATE_FORMAT(redeemed_at, '%b')`), 'month'],
    [sequelize.fn('SUM', sequelize.col('discount_amount')), 'discount'],
  ],
  where: {
    coupon_id: { [Op.in]: couponIds },
  },
  group: [sequelize.literal(`DATE_FORMAT(redeemed_at, '%b')`)],
  order: [sequelize.literal(`MIN(redeemed_at)`)],
  raw: true,
});

const performanceData = performance.map(p => ({
  month: p.month,
  revenue: 0, // Placeholder
  discountedRevenue: 0, // Placeholder
  discount: parseFloat(p.discount),
}));

    // 5. Format discount list
    const discounts = coupons.map(c => ({
      id: c.id,
      name: c.description || c.code,
      code: c.code,
      type: c.type,
      value: parseFloat(c.value),
      status: c.status,
      usageLimit: c.usage_limit,
      usageCount: c.usage_count,
      startDate: c.start_date?.toISOString().split("T")[0] || "",
      endDate: c.end_date?.toISOString().split("T")[0] || "",
    }));

    return res.json({
      stats,
      performance: performanceData,
      discounts,
    });
  } catch (error) {
    console.error("Error fetching discount analytics:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


exports.getSellerDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const sellerId = await getSellerIdByUserId(userId);

    // Total Products
    const totalProducts = await Product.count({ where: { seller_id: sellerId } });

    // Fetch all order items for seller with order creation date
    const orderItems = await OrderItem.findAll({
      where: { seller_id: sellerId },
      include: [
        {
          model: Order,
          attributes: ['id', 'created_at']
        }
      ]
    });

    // Calculate total revenue and orders
    const totalRevenue = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalOrders = new Set(orderItems.map(item => item.order_id)).size;
    const averageOrder = totalOrders ? totalRevenue / totalOrders : 0;

    // --- Helper: Calculate trends for last N days/weeks/months ---
    const getDateNDaysAgo = (n) => {
      const date = new Date();
      date.setDate(date.getDate() - n);
      return date;
    };

    // --- Daily Revenue & Orders for last 10 days ---
    const last10Days = [];
    for (let i = 9; i >= 0; i--) {
      last10Days.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        revenue: 0,
        orders: new Set(),
      });
    }

    // Aggregate order items into daily buckets
    orderItems.forEach(item => {
      const orderDate = item.Order.created_at.toISOString().slice(0, 10);
      const dayBucket = last10Days.find(d => d.date === orderDate);
      if (dayBucket) {
        dayBucket.revenue += item.price * item.quantity;
        dayBucket.orders.add(item.order_id);
      }
    });

    // Format daily data for response
    const dailyData = last10Days.map(d => ({
      date: d.date,
      revenue: Math.round(d.revenue),
      orders: d.orders.size,
    }));

    // --- Weekly Revenue & Orders for last 4 weeks ---
    // We'll consider a week as last 7 days from today, grouped by week number
    // For simplicity, group by year-week string

    // Get year-week string from date
    const getYearWeek = (date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const firstDayOfYear = new Date(year, 0, 1);
      const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
      const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      return `${year}-W${weekNumber}`;
    };

    // Find last 4 weeks labels
    const weeklyLabels = [];
    for (let i = 3; i >= 0; i--) {
      const now = new Date();
      now.setDate(now.getDate() - i * 7);
      weeklyLabels.push(getYearWeek(now));
    }

    const weeklyDataMap = {};
    weeklyLabels.forEach(w => {
      weeklyDataMap[w] = { revenue: 0, orders: new Set() };
    });

    orderItems.forEach(item => {
      const orderWeek = getYearWeek(item.Order.created_at);
      if (weeklyDataMap[orderWeek]) {
        weeklyDataMap[orderWeek].revenue += item.price * item.quantity;
        weeklyDataMap[orderWeek].orders.add(item.order_id);
      }
    });

    const weeklyData = Object.entries(weeklyDataMap).map(([week, data]) => ({
      date: week,
      revenue: Math.round(data.revenue),
      orders: data.orders.size,
    }));

    // --- Monthly Revenue & Orders for last 4 months ---
    const monthlyLabels = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyLabels.push(`${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`);
    }

    const monthlyDataMap = {};
    monthlyLabels.forEach(m => {
      monthlyDataMap[m] = { revenue: 0, orders: new Set() };
    });

    orderItems.forEach(item => {
      const orderDate = item.Order.created_at;
      const monthYear = `${orderDate.toLocaleString('default', { month: 'short' })} ${orderDate.getFullYear()}`;
      if (monthlyDataMap[monthYear]) {
        monthlyDataMap[monthYear].revenue += item.price * item.quantity;
        monthlyDataMap[monthYear].orders.add(item.order_id);
      }
    });

    const monthlyData = Object.entries(monthlyDataMap).map(([month, data]) => ({
      date: month,
      revenue: Math.round(data.revenue),
      orders: data.orders.size,
    }));

    // --- Calculate percentage changes compared to previous period ---

    function calcChange(currentArr) {
      if (currentArr.length < 2) return 0;
      const lastValue = currentArr[currentArr.length - 1];
      const prevValue = currentArr[currentArr.length - 2];
      if (prevValue === 0) return 100;
      return ((lastValue - prevValue) / prevValue) * 100;
    }

    // Prepare arrays for revenue and orders from daily data
    const revenueTrend = dailyData.map(d => d.revenue);
    const ordersTrend = dailyData.map(d => d.orders);

    // For conversion rate, assuming fake data here (replace with real sessions/users if you have)
    const conversionTrend = revenueTrend.map(r => (r > 0 ? 3 + Math.random() * 1 : 0)); // fake conversion rate

    // Calculate changes for metrics (compare last day with previous)
    const revenueChange = calcChange(revenueTrend);
    const ordersChange = calcChange(ordersTrend);
    const conversionChange = calcChange(conversionTrend);

    // --- Top Products ---
    const topProductsData = await OrderItem.findAll({
      where: { seller_id: sellerId },
      attributes: [
        'product_variant_id',
        [fn('SUM', col('quantity')), 'totalSold'],
        [fn('SUM', literal('price * quantity')), 'totalRevenue'],
      ],
      group: ['product_variant_id', 'ProductVariant.id', 'ProductVariant.Product.id', 'ProductVariant.Product.Category.name'],
      order: [[literal('totalSold'), 'DESC']],
      limit: 5,
      include: [
        {
          model: ProductVariant,
          include: [
            {
              model: Product,
              attributes: ['name',  ],
              include : [
                {
                  model : Category

                }
              ]
            }
          ]
        }
      ]
    });

    // --- Inventory ---
    const inventory = await Inventory.findAll({
      include: [
        {
          model: ProductVariant,
          required: true,
          include: [
            {
              model: Product,
              required: true,
              attributes: [ 'name'],
              where: { seller_id: sellerId }
            }
          ]
        }
      ]
    });

    // Group inventory by category
    const inventoryByCategory = {};
    inventory.forEach(item => {
      const category = item.ProductVariant.Product.category || 'Other';
      if (!inventoryByCategory[category]) {
        inventoryByCategory[category] = { stock: 0, total: 0 };
      }
      inventoryByCategory[category].stock += item.stock;
      inventoryByCategory[category].total += item.stock; // Adjust if you have total capacity stored somewhere
    });

    // Format inventory for dashboard
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    const inventoryStatus = Object.entries(inventoryByCategory).map(([name, { stock, total }], i) => ({
      name,
      value: stock,
      color: colors[i % colors.length],
      stock,
      total,
    }));

    // --- Recent Orders ---
    const recentOrdersRaw = await Order.findAll({
      where: {},
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: OrderItem,
          where: { seller_id: sellerId },
          include: [
            {
              model: ProductVariant,
              include: [
                {
                  model: Product,
                  attributes: ['name']
                }
              ]
            }
          ]
        },
        { model: User, attributes: ['id', 'name', 'email', 'profileImage'] },
        { model: Payment, attributes: ['status'] }
      ]
    });

    const recentOrders = recentOrdersRaw.map(order => ({
      id: `ORD-${order.id}`,
      customer: {
        name: order.User?.name || 'Unknown',
        email: order.User?.email || '',
        avatar: order.User?.avatar || '/images/default-avatar.png',
      },
      status: order.Payment?.status || 'unknown',
      date: order.created_at?.toISOString().slice(0, 10) || '',
      total: order.OrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      items: order.OrderItems.reduce((sum, item) => sum + item.quantity, 0),
    }));

    // Format top products
    const topProducts = topProductsData.map(item => ({
      id: `pv-${item.product_variant_id}`,
      name: item.ProductVariant?.Product?.name || 'Unknown Product',
      category: item.ProductVariant?.Product?.category || 'Unknown',
      image: item.ProductVariant?.Product?.image || '/images/default-product.png',
      sales: parseInt(item.dataValues.totalSold) || 0,
      revenue: parseFloat(item.dataValues.totalRevenue) || 0,
      stock: 0, // Optionally link inventory stock here
      trend: 'stable', // You can add trend calculation logic
    }));

    // Final response
    const dashboardData = {
      totalRevenue,
      revenueChange,
      revenueTrend,

      totalOrders,
      ordersChange,
      ordersTrend,

      conversionRate: conversionTrend[conversionTrend.length - 1] || 0,
      conversionChange,
      conversionTrend,

      averageOrder,
      averageOrderChange: 0, // You can calculate this if needed
      averageOrderTrend: [],

      salesData: {
        daily: dailyData,
        weekly: weeklyData,
        monthly: monthlyData,
      },

      topProducts,

      recentOrders,

      inventoryStatus,
    };

    res.json(dashboardData);

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
