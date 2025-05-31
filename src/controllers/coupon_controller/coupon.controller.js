const db = require("../../../config/database");
const { Coupon, Seller } = db;
const { Op } = require("sequelize");
const getSellerIdByUserId = require("../../utils/getSellerIdByUserId");

class CouponController {
  // Create a new coupon

  static async createCoupon(req, res) {
    try {
      const user_id = req.user.id;
      console.log("User ID:", user_id);
      
      if (!user_id) {
          return res.status(401).json({ message: "Unauthorized user." });
        }
        
        const seller_id = await getSellerIdByUserId(user_id);
        
        console.log("Seller ID:", seller_id);
      if (!seller_id) {
        return res
          .status(404)
          .json({ message: "Seller not found for this user." });
        }
      // Validate the Coupon code is unique
      const existingCoupon = await Coupon.findOne({
        where: { code: req.body.code },
    });
    
    if (existingCoupon) {
        return res.status(400).json({
            message: "Coupon code already exists. Please use a different code.",
        });
    }
    
    console.log("Request Body:", req.body);

      // Create the Coupon
      const CouponData = {
        ...req.body,
        seller_id: seller_id,
        usage_count: 0,
      };

      console.log(CouponData, "Coupon data for me");
      // Convert dates if they're strings
      if (typeof CouponData.start_date === "string") {
        CouponData.start_date = new Date(CouponData.start_date);
      }

      if (typeof CouponData.end_date === "string") {
        CouponData.end_date = new Date(CouponData.end_date);
      }

      // Convert arrays to JSON strings if needed
      if (CouponData.product_ids && Array.isArray(CouponData.product_ids)) {
        CouponData.product_ids = JSON.stringify(CouponData.product_ids);
      }

      if (
        CouponData.category_ids &&
        Array.isArray(CouponData.category_ids)
      ) {
        CouponData.category_ids = JSON.stringify(CouponData.category_ids);
      }

      const newCoupon = await Coupon.create(CouponData);

      res.status(201).json({
        id: newCoupon.id,
        code: newCoupon.code,
        description: newCoupon.description,
        type: newCoupon.type,
        value: parseFloat(newCoupon.value),
        minPurchase: parseFloat(newCoupon.min_purchase),
        startDate: newCoupon.start_date.toISOString().split("T")[0],
        endDate: newCoupon.end_date.toISOString().split("T")[0],
        usageLimit: newCoupon.usage_limit,
        usageCount: newCoupon.usage_count,
        status: newCoupon.status,
        appliesTo: newCoupon.applies_to,
        isFirstOrderOnly: newCoupon.is_first_order_only,
        isOneTimeUse: newCoupon.is_one_time_use,
      });
    } catch (error) {
      console.error("Error creating Coupon:", error);
      res.status(500).json({ message: "Error creating Coupon", error: error.message });
    }
  }

  // Get all coupons with optional filters
  static async getAllCoupons(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        seller_id,
        is_active,
        Coupon_type,
        search,
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Apply filters
      if (seller_id) whereClause.seller_id = seller_id;
      if (is_active !== undefined) whereClause.is_active = is_active === "true";
      if (Coupon_type) whereClause.Coupon_type = Coupon_type;
      if (search) {
        whereClause.code = {
          [Op.iLike]: `%${search}%`,
        };
      }

      const { count, rows } = await Coupon.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["created_at", "DESC"]],
      });

      res.status(200).json({
        success: true,
        data: {
          coupons: rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // Get coupon by ID
  static async getCouponById(req, res) {
    try {
      const { id } = req.params;

      const coupon = await Coupon.findByPk(id);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: "Coupon not found",
        });
      }

      res.status(200).json({
        success: true,
        data: coupon,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // Get coupon by code
  static async getCouponByCode(req, res) {
    try {
      const { code } = req.params;

      const coupon = await Coupon.findOne({
        where: { code },
      });

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: "Coupon not found",
        });
      }

      res.status(200).json({
        success: true,
        data: coupon,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // Get coupons by seller ID (for current authenticated user)
  static async getCouponsBySellerId(req, res) {
    try {
      // Get user_id from authenticated user
      const user_id = req.user?.id || req.user?.user_id;

      if (!user_id) {
        return res.status(401).json({
          success: false,
          message: "User authentication required",
        });
      }

      // Find seller by user_id
      const seller = await Seller.findOne({
        where: { user_id: user_id },
      });

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: "Seller profile not found for this user",
        });
      }

      const { page = 1, limit = 10, is_active } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = { seller_id: seller.id };

      if (is_active !== undefined) {
        whereClause.is_active = is_active === "true";
      }

      const { count, rows } = await Coupon.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["created_at", "DESC"]],
      });

      res.status(200).json({
        success: true,
        data: {
          coupons: rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // Get coupons by specific seller ID (admin use)
  static async getCouponsBySpecificSellerId(req, res) {
    try {
      const { seller_id } = req.params;
      const { page = 1, limit = 10, is_active } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = { seller_id };

      if (is_active !== undefined) {
        whereClause.is_active = is_active === "true";
      }

      const { count, rows } = await Coupon.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["created_at", "DESC"]],
      });

      res.status(200).json({
        success: true,
        data: {
          coupons: rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // Update coupon
  static async updateCoupon(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Get user_id from authenticated user
      const user_id = req.user?.id || req.user?.user_id;

      if (!user_id) {
        return res.status(401).json({
          success: false,
          message: "User authentication required",
        });
      }

      // Find seller by user_id
      const seller = await Seller.findOne({
        where: { user_id: user_id },
      });

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: "Seller profile not found for this user",
        });
      }

      const coupon = await Coupon.findByPk(id);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: "Coupon not found",
        });
      }

      // Check if the coupon belongs to the authenticated seller
      if (coupon.seller_id !== seller.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only update your own coupons",
        });
      }

      // Validate dates if provided
      if (updateData.start_date && updateData.end_date) {
        if (new Date(updateData.start_date) >= new Date(updateData.end_date)) {
          return res.status(400).json({
            success: false,
            message: "Start date must be before end date",
          });
        }
      }

      // Update timestamp
      updateData.updated_at = new Date();

      await coupon.update(updateData);

      res.status(200).json({
        success: true,
        message: "Coupon updated successfully",
        data: coupon,
      });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
          success: false,
          message: "Coupon code already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // Delete coupon (soft delete by setting is_active to false)
  static async deleteCoupon(req, res) {
    try {
      const { id } = req.params;

      // Get user_id from authenticated user
      const user_id = req.user?.id || req.user?.user_id;

      if (!user_id) {
        return res.status(401).json({
          success: false,
          message: "User authentication required",
        });
      }

      // Find seller by user_id
      const seller = await Seller.findOne({
        where: { user_id: user_id },
      });

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: "Seller profile not found for this user",
        });
      }

      const coupon = await Coupon.findByPk(id);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: "Coupon not found",
        });
      }

      // Check if the coupon belongs to the authenticated seller
      if (coupon.seller_id !== seller.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only delete your own coupons",
        });
      }

      await coupon.update({
        is_active: false,
        updated_at: new Date(),
      });

      res.status(200).json({
        success: true,
        message: "Coupon deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // Hard delete coupon (permanent deletion)
  static async hardDeleteCoupon(req, res) {
    try {
      const { id } = req.params;

      // Get user_id from authenticated user (admin only)
      const user_id = req.user?.id || req.user?.user_id;

      if (!user_id) {
        return res.status(401).json({
          success: false,
          message: "User authentication required",
        });
      }

      // Check if user is admin (assuming role is available in req.user)
      if (req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. Admin privileges required for permanent deletion",
        });
      }

      const coupon = await Coupon.findByPk(id);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: "Coupon not found",
        });
      }

      await coupon.destroy();

      res.status(200).json({
        success: true,
        message: "Coupon permanently deleted",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // Validate coupon for order
  static async validateCoupon(req, res) {
    try {
      const { code } = req.params;
      const { order_amount } = req.body;

      const coupon = await Coupon.findOne({
        where: {
          code,
          is_active: true,
          start_date: { [Op.lte]: new Date() },
          end_date: { [Op.gte]: new Date() },
        },
      });

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: "Invalid or expired coupon",
        });
      }

      // Check minimum order amount
      if (coupon.min_order_amount && order_amount < coupon.min_order_amount) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount of ${coupon.min_order_amount} required`,
        });
      }

      // Calculate Coupon
      let Coupon = 0;
      if (coupon.Coupon_type === "percentage") {
        Coupon = (order_amount * coupon.value) / 100;
        if (coupon.max_Coupon && Coupon > coupon.max_Coupon) {
          Coupon = coupon.max_Coupon;
        }
      } else {
        Coupon = coupon.value;
      }

      res.status(200).json({
        success: true,
        message: "Coupon is valid",
        data: {
          coupon,
          Coupon: Math.min(Coupon, order_amount),
          final_amount: Math.max(0, order_amount - Coupon),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
}

module.exports = CouponController;
