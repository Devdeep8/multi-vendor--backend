const db = require("../../../config/database");
const mailer = require("../../utils/mailer");

// Send email notification
exports.sendEmail = async (req, res) => {
  try { 
    const { type, recipient, data } = req.body;

    if (!type || !recipient || !data) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: type, recipient, data",
      });
    }

    let emailContent;
    let emailSent = false;

    switch (type) {
      case "order_confirmation":
        // Validate required data
        if (!data.order_id) {
          return res.status(400).json({
            success: false,
            message: "Missing order_id in data",
          });
        }

        // Get order details from database
        const order = await db.Order.findByPk(data.order_id, {
          include: [
            {
              model: db.OrderItem,
              include: [
                {
                  model: db.Product,
                  attributes: ["id", "name", "description"],
                },
              ],
            },
            {
              model: db.User,
              attributes: ["id", "name", "email"],
            },
          ],
        });

        if (!order) {
          return res.status(404).json({
            success: false,
            message: "Order not found",
          });
        }

        // Generate email content
        emailContent = mailer.generateOrderConfirmationEmail(order, order.User);
        
        // Send email
        await mailer.sendEmail({
          to: recipient,
          subject: emailContent.subject,
          html: emailContent.html,
        });
        
        emailSent = true;
        break;

      case "order_status_update":
        // Validate required data
        if (!data.order_id || !data.status) {
          return res.status(400).json({
            success: false,
            message: "Missing order_id or status in data",
          });
        }

        // Get order details from database
        const updatedOrder = await db.Order.findByPk(data.order_id, {
          include: [
            {
              model: db.User,
              attributes: ["id", "name", "email"],
            },
          ],
        });

        if (!updatedOrder) {
          return res.status(404).json({
            success: false,
            message: "Order not found",
          });
        }

        // Generate email content
        emailContent = mailer.generateOrderStatusUpdateEmail(updatedOrder, updatedOrder.User);
        
        // Send email
        await mailer.sendEmail({
          to: recipient,
          subject: emailContent.subject,
          html: emailContent.html,
        });
        
        emailSent = true;
        break;

      case "seller_order_notification":
        // Validate required data
        if (!data.order_id || !data.seller_id) {
          return res.status(400).json({
            success: false,
            message: "Missing order_id or seller_id in data",
          });
        }

        // Get order details from database
        const sellerOrder = await db.Order.findByPk(data.order_id, {
          include: [
            {
              model: db.OrderItem,
              include: [
                {
                  model: db.Product,
                  where: { seller_id: data.seller_id },
                  attributes: ["id", "name", "description", "seller_id"],
                },
              ],
            },
            {
              model: db.User,
              attributes: ["id", "name", "email"],
            },
          ],
        });

        if (!sellerOrder) {
          return res.status(404).json({
            success: false,
            message: "Order not found",
          });
        }

        // Get seller details
        const seller = await db.User.findByPk(data.seller_id, {
          attributes: ["id", "name", "email"],
        });

        if (!seller) {
          return res.status(404).json({
            success: false,
            message: "Seller not found",
          });
        }

        // Filter items for this seller
        const sellerItems = sellerOrder.OrderItems.filter(
          (item) => item.Product && item.Product.seller_id === data.seller_id
        );

        // Generate email content
        emailContent = mailer.generateSellerNotificationEmail(sellerOrder, seller, sellerItems);
        
        // Send email
        await mailer.sendEmail({
          to: recipient,
          subject: emailContent.subject,
          html: emailContent.html,
        });
        
        emailSent = true;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid notification type",
        });
    }

    if (emailSent) {
      return res.status(200).json({
        success: true,
        message: "Email notification sent successfully",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send email notification",
      });
    }
  } catch (error) {
    console.error("Error sending notification:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: error.message,
    });
  }
};

// Send notification for new order
exports.sendOrderNotifications = async (order, user) => {
  console.log('Sending order notifications...' , user);
  try {
    // Send confirmation to customer
    if (user && user.email) {
      const customerEmailContent = mailer.generateOrderConfirmationEmail(order, user);
      await mailer.sendEmail({
        to: user.email,
        subject: customerEmailContent.subject,
        html: customerEmailContent.html,
      });
      console.log(`Order confirmation email sent to customer: ${user.email}`);
    }

    // Get all sellers involved in this order
    const orderItems = await db.OrderItem.findAll({
      where: { order_id: order.id },
      include: [
        {
          model: db.Product,
          attributes: ["id", "name", "seller_id"],
        },
      ],
    });

    // Group items by seller
    const sellerItems = {};
    orderItems.forEach((item) => {
      if (item.Product && item.Product.seller_id) {
        if (!sellerItems[item.Product.seller_id]) {
          sellerItems[item.Product.seller_id] = [];
        }
        sellerItems[item.Product.seller_id].push(item);
      }
    });

    // Send notification to each seller
    for (const sellerId in sellerItems) {
      const seller = await db.User.findByPk(sellerId, {
        attributes: ["id", "name", "email"],
      });

      if (seller && seller.email) {
        const sellerEmailContent = mailer.generateSellerNotificationEmail(
          order,
          seller,
          sellerItems[sellerId]
        );
        
        await mailer.sendEmail({
          to: seller.email,
          subject: sellerEmailContent.subject,
          html: sellerEmailContent.html,
        });
        
        console.log(`Order notification email sent to seller: ${seller.email}`);
      }
    }

    // Send notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || "admin@ratantech.com";
    const adminEmailContent = mailer.generateOrderConfirmationEmail(order, { name: "Admin" });
    
    await mailer.sendEmail({
      to: adminEmail,
      subject: `[ADMIN] ${adminEmailContent.subject}`,
      html: adminEmailContent.html,
    });
    
    console.log(`Order notification email sent to admin: ${adminEmail}`);

    return true;
  } catch (error) {
    console.error("Error sending order notifications:", error);
    return false;
  }
};

// Send notification for order status update
exports.sendOrderStatusUpdateNotifications = async (order) => {
  try {
    // Get user details
    const user = await db.User.findByPk(order.user_id, {
      attributes: ["id", "name", "email"],
    });

    // Send update to customer
    if (user && user.email) {
      const customerEmailContent = mailer.generateOrderStatusUpdateEmail(order, user);
      await mailer.sendEmail({
        to: user.email,
        subject: customerEmailContent.subject,
        html: customerEmailContent.html,
      });
      console.log(`Order status update email sent to customer: ${user.email}`);
    }

    // Get all sellers involved in this order
    const orderItems = await db.OrderItem.findAll({
      where: { order_id: order.id },
      include: [
        {
          model: db.Product,
          attributes: ["id", "name", "seller_id"],
        },
      ],
    });

    // Group items by seller
    const sellerIds = new Set();
    orderItems.forEach((item) => {
      if (item.Product && item.Product.seller_id) {
        sellerIds.add(item.Product.seller_id);
      }
    });

    // Send notification to each seller
    for (const sellerId of sellerIds) {
      const seller = await db.User.findByPk(sellerId, {
        attributes: ["id", "name", "email"],
      });

      if (seller && seller.email) {
        const sellerEmailContent = mailer.generateOrderStatusUpdateEmail(order, seller);
        
        await mailer.sendEmail({
          to: seller.email,
          subject: sellerEmailContent.subject,
          html: sellerEmailContent.html,
        });
        
        console.log(`Order status update email sent to seller: ${seller.email}`);
      }
    }

    return true;
  } catch (error) {
    console.error("Error sending order status update notifications:", error);
    return false;
  }
};