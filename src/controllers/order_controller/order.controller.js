const db = require('../../../config/database');
const { Order, OrderItem, Payment, CouponRedemption, Coupon, ProductVariant, Cart  , Inventory , Product} = db;
const OrderController = {
  // Create a new order
async create(req, res) {
  const t = await Order.sequelize.transaction();
  try {
    const {
      user_id,
      total_amount,
      discount_amount = 0,
      coupon_id,
      billing_address_id,
      shipping_address_id,
      order_status,
      payment_status,
      payment_method,
      payment_reference,
      items = [],
    } = req.body;

    console.log("Order Creation Request Body:", req.body);

    if (!items.length) {
      return res.status(400).json({ success: false, message: "Order must have at least one item." });
    }

    // 1. Validate stock for each item before proceeding
    for (const item of items) {
      const inventory = await Inventory.findOne({
        where: { product_variant_id: item.product_variant_id },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!inventory || inventory.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for variant ${item.product_variant_id}`,
        });
      }
    }

    // 2. Create Order
    const order = await Order.create({
      user_id,
      total_amount,
      discount_amount,
      coupon_id,
      billing_address_id,
      shipping_address_id,
      order_status,
      payment_status,
    }, { transaction: t });

    // 3. Create OrderItems and decrement stock
    for (const item of items) {
      await OrderItem.create({
        order_id: order.id,
        product_variant_id: item.product_variant_id,
        seller_id: item.seller_id,
        quantity: item.quantity,
        price: item.price,
      }, { transaction: t });

      // Reduce stock
      await Inventory.decrement(
        { stock: item.quantity },
        {
          where: { product_variant_id: item.product_variant_id },
          transaction: t,
        }
      );
    }

    // 4. Record Payment
    await Payment.create({
      order_id: order.id,
      method: payment_method,
      reference: payment_reference,
      status: payment_status,
    }, { transaction: t });

    // 5. If coupon is used, log redemption and increment usage
    if (coupon_id) {
      await CouponRedemption.create({
        coupon_id,
        user_id,
        order_id: order.id,
        discount_amount,
      }, { transaction: t });

      await Coupon.increment('usage_count', {
        by: 1,
        where: { id: coupon_id },
        transaction: t,
      });

      await Cart.destroy({
  where: {
    user_id,
    product_variant_id: items.map(i => i.product_variant_id),
  },
  transaction: t,
});
    }

    await t.commit();
    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order_id: order.id,
    });

  } catch (err) {
    await t.rollback();
    console.error("Order creation failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: err.message,
    });
  }
},

  // Get all orders (admin/seller)
  async getAll(req, res) {
    try {
      const orders = await Order.findAll({
        include: [
          { model: OrderItem, include: [{ model: ProductVariant }] },
          { model: Payment },
          { model: Coupon },
        ],
        order: [["created_at", "DESC"]],
      });
      return res.status(200).json({ success: true, orders });
    } catch (err) {
      console.error("Fetch orders failed:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch orders", error: err.message });
    }
  },

  // Get a single order by ID
  async getById(req, res) {
    try {
      const order = await Order.findByPk(req.params.id, {
        include: [
          { model: OrderItem, include: [{ model: ProductVariant }] },
          { model: Payment },
          { model: Coupon },
        ],
      });

      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      return res.status(200).json({ success: true, order });
    } catch (err) {
      console.error("Fetch order failed:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch order", error: err.message });
    }
  },


async getByUserId(req, res) {
  try {
    const { user_id } = req.params;

    const orders = await Order.findAll({
      where: { user_id },
      attributes: ['id', 'order_status', 'payment_status', 'total_amount', 'discount_amount', 'created_at'],
      include: [
        {
          model: OrderItem,
          attributes: ['quantity', 'price'],
          include: [
            {
              model: ProductVariant,
              attributes: ['id', 'size', 'color', 'image_url'],
              include: [
                {
                  model: Product,
                  attributes: ['name', 'slug'],
                }
              ]
            }
          ]
        },
        {
          model: Payment,
          attributes: ['status', 'method']
        },
        {
          model: Coupon,
          attributes: ['code', 'type', 'value']
        }
      ],
      order: [['created_at', 'DESC']],
    });

    const formatted = orders.map(order => {
      const items = order.OrderItems.map(item => {
        const variant = item.ProductVariant || {};
        const product = variant.Product || {};

        return {
          product_name: product.name,
          product_slug: product.slug,
          size: variant.size,
          color: variant.color,
          image_url: variant.image_url ? JSON.parse(variant.image_url) : null, // If stored as JSON string
          quantity: item.quantity,
          price: item.price,
          total_price: item.price * item.quantity
        };
      });

      return {
        id: order.id,
        order_status: order.order_status,
        payment_status: order.payment_status,
        total_amount: order.total_amount,
        discount_amount: order.discount_amount,
        created_at: order.created_at,
        payment_method: order.Payment?.method || null,
        payment_status_detail: order.Payment?.status || null,
        coupon: order.Coupon
          ? {
              code: order.Coupon.code,
              type: order.Coupon.type,
              value: order.Coupon.value,
            }
          : null,
        items,
      };
    });

    return res.status(200).json({ success: true, orders: formatted });
  } catch (err) {
    console.error("Fetch user orders failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user orders",
      error: err.message,
    });
  }
}



};

module.exports = OrderController;