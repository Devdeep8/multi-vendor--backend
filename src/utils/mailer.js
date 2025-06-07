const nodemailer = require('nodemailer');


// Create a transporter object
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: { 
    user: 'rohantest28@gmail.com',
    pass: 'vemf gwkj awum dsge',
  },
});
 
// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} [options.text] - Email plain text content
 * @returns {Promise} - Nodemailer send mail promise
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Ratantech E-commerce <noreply@ratantech.com>',
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Generate order confirmation email content
 * @param {Object} order - Order details
 * @param {Object} user - User details
 * @returns {Object} - Email content with subject, text and html
 */
const generateOrderConfirmationEmail = (order, user) => {
  const subject = `Order Confirmation #${order.order_number}`;
  
  // Generate items HTML
  let itemsHtml = '';
  if (order.OrderItems && order.OrderItems.length > 0) {
    itemsHtml = order.OrderItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">$${parseFloat(item.price).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">$${parseFloat(item.total_price).toFixed(2)}</td>
      </tr>
    `).join('');
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h1 style="color: #333;">Order Confirmation</h1>
        <p>Thank you for your order!</p>
      </div>
      
      <div style="padding: 20px;">
        <h2 style="color: #333;">Order #${order.order_number}</h2>
        <p>Hello ${user.name},</p>
        <p>Your order has been received and is now being processed. Here's a summary of your purchase:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: left;">Quantity</th>
              <th style="padding: 10px; text-align: left;">Price</th>
              <th style="padding: 10px; text-align: left;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Shipping:</td>
              <td style="padding: 10px;">$${parseFloat(order.shipping_fee).toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding: 10px; font-weight: bold;">$${parseFloat(order.total_amount).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="margin-top: 30px;">
          <h3 style="color: #333;">Shipping Address</h3>
          <p>${order.shipping_address}</p>
          
          <h3 style="color: #333;">Payment Method</h3>
          <p>${order.payment_method}</p>
          
          <h3 style="color: #333;">Order Status</h3>
          <p>${order.order_status}</p>
        </div>
        
        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          <p>If you have any questions about your order, please contact our customer service at support@ratantech.com</p>
        </div>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #777;">
        <p>&copy; ${new Date().getFullYear()} Ratantech E-commerce. All rights reserved.</p>
      </div>
    </div>
  `;

  return {
    subject,
    html
  };
};

/**
 * Generate order status update email content
 * @param {Object} order - Order details
 * @param {Object} user - User details
 * @returns {Object} - Email content with subject, text and html
 */
const generateOrderStatusUpdateEmail = (order, user) => {
  const subject = `Order Status Update #${order.order_number}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h1 style="color: #333;">Order Status Update</h1>
      </div>
      
      <div style="padding: 20px;">
        <h2 style="color: #333;">Order #${order.order_number}</h2>
        <p>Hello ${user.name},</p>
        <p>The status of your order has been updated to: <strong>${order.order_status}</strong></p>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <h3 style="color: #333; margin-top: 0;">Order Details</h3>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Payment Status:</strong> ${order.payment_status}</p>
          <p><strong>Total Amount:</strong> $${parseFloat(order.total_amount).toFixed(2)}</p>
        </div>
        
        <div style="margin-top: 30px;">
          <h3 style="color: #333;">What's Next?</h3>
          ${order.order_status === 'processing' ? `
            <p>Your order is being prepared for shipping. You'll receive another notification when it's on the way.</p>
          ` : order.order_status === 'shipped' ? `
            <p>Your order is on the way! You'll receive another notification when it's delivered.</p>
          ` : order.order_status === 'delivered' ? `
            <p>Your order has been delivered. We hope you enjoy your purchase!</p>
          ` : order.order_status === 'cancelled' ? `
            <p>Your order has been cancelled. If you have any questions, please contact our customer service.</p>
          ` : `
            <p>We'll keep you updated on any further changes to your order status.</p>
          `}
        </div>
        
        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          <p>If you have any questions about your order, please contact our customer service at support@ratantech.com</p>
        </div>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #777;">
        <p>&copy; ${new Date().getFullYear()} Ratantech E-commerce. All rights reserved.</p>
      </div>
    </div>
  `;

  return {
    subject,
    html
  };
};

/**
 * Generate seller notification email content
 * @param {Object} order - Order details
 * @param {Object} seller - Seller details
 * @param {Array} sellerItems - Items from this seller in the order
 * @returns {Object} - Email content with subject, text and html
 */
const generateSellerNotificationEmail = (order, seller, sellerItems) => {
  const subject = `New Order #${order.order_number}`;
  
  // Generate items HTML
  let itemsHtml = '';
  if (sellerItems && sellerItems.length > 0) {
    itemsHtml = sellerItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">$${parseFloat(item.price).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">$${parseFloat(item.total_price).toFixed(2)}</td>
      </tr>
    `).join('');
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h1 style="color: #333;">New Order Notification</h1>
      </div>
      
      <div style="padding: 20px;">
        <h2 style="color: #333;">Order #${order.order_number}</h2>
        <p>Hello ${seller.name},</p>
        <p>You have received a new order. Here are the details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: left;">Quantity</th>
              <th style="padding: 10px; text-align: left;">Price</th>
              <th style="padding: 10px; text-align: left;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total for your items:</td>
              <td style="padding: 10px; font-weight: bold;">$${sellerItems.reduce((sum, item) => sum + parseFloat(item.total_price), 0).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="margin-top: 30px;">
          <h3 style="color: #333;">Customer Information</h3>
          <p><strong>Name:</strong> ${order.User ? order.User.name : 'Customer'}</p>
          <p><strong>Email:</strong> ${order.User ? order.User.email : 'Not available'}</p>
          
          <h3 style="color: #333;">Shipping Address</h3>
          <p>${order.shipping_address}</p>
          
          <h3 style="color: #333;">Order Notes</h3>
          <p>${order.notes || 'No notes provided'}</p>
        </div>
        
        <div style="margin-top: 30px; background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
          <p>Please process this order as soon as possible. You can manage this order from your seller dashboard.</p>
        </div>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #777;">
        <p>&copy; ${new Date().getFullYear()} Ratantech E-commerce. All rights reserved.</p>
      </div>
    </div>
  `;

  return {
    subject,
    html
  };
}; 

module.exports = {
  sendEmail,
  generateOrderConfirmationEmail,
  generateOrderStatusUpdateEmail,
  generateSellerNotificationEmail
};