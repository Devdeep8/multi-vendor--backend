const db = require('../../../config/database');

// Add item to cart 
const {Address , Seller} = db;



exports.getAddresses = async (req, res) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    // Fetch all addresses of the user
    const addresses = await Address.findAll({
      where: { user_id },
      attributes: {
        exclude: ["createdAt", "updatedAt"], // Keep full_name for display
      },
      order: [['updatedAt', 'DESC']], // Most recent first
    });

    if (!addresses || addresses.length === 0) {
      return res.status(404).json({ message: "No addresses found." });
    }

    // Extract shipping and billing addresses
    const shippingAddress = addresses.find(addr => addr.type === "shipping");
    const billingAddress = addresses.find(addr => addr.type === "billing");

    let billingSameAsShipping = false;

    if (shippingAddress && billingAddress) {
      // Compare if billing and shipping are effectively the same (excluding id and type)
      const keysToCompare = [
        "line1",
        "line2", 
        "city",
        "state",
        "postal_code",
        "country",
        "phone_number",
        "full_name"
      ];

      billingSameAsShipping = keysToCompare.every(
        key => shippingAddress[key] === billingAddress[key]
      );
    }

    // Return comprehensive address data
    const response = {
      shippingAddress: shippingAddress || null,
      billingAddress: billingAddress || null,
      billingSameAsShipping: billingSameAsShipping,
      hasExistingAddresses: addresses.length > 0,
      addressCount: addresses.length
    };

    return res.status(200).json(response);
    
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.getAllUserAddresses = async (req, res) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    // Fetch all addresses with basic info
    const addresses = await Address.findAll({
      where: { user_id },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      order: [['updatedAt', 'DESC']],
    });

    // Group addresses by type for easier frontend handling
    const groupedAddresses = {
      shipping: addresses.filter(addr => addr.type === "shipping"),
      billing: addresses.filter(addr => addr.type === "billing"),
      all: addresses
    };

    return res.status(200).json({
      success: true,
      addresses: groupedAddresses,
      count: addresses.length
    });
    
  } catch (error) {
    console.error("Error fetching all addresses:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.createAddress = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { type, ...addressData } = req.body;

    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    // Validate required fields
    const requiredFields = ['full_name', 'line1', 'city', 'state', 'country', 'postal_code', 'phone_number'];
    const missingFields = requiredFields.filter(field => !addressData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: "Missing required fields", 
        missingFields 
      });
    }

    // Validate address type
    if (!type || !['shipping', 'billing'].includes(type)) {
      return res.status(400).json({ message: "Invalid address type. Must be 'shipping' or 'billing'." });
    }

    // Create new address
    const newAddress = await Address.create({
      user_id,
      type,
      ...addressData
    });

    return res.status(201).json({
      success: true,
      message: "Address created successfully",
      address: newAddress
    });

  } catch (error) {
    console.error("Error creating address:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { id } = req.params;
    const updateData = req.body;

    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    // Find and verify ownership
    const address = await Address.findOne({
      where: { id, user_id }
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found or access denied." });
    }

    // Update address
    await address.update(updateData);

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address
    });

  } catch (error) {
    console.error("Error updating address:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { id } = req.params;

    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    // Find and verify ownership
    const address = await Address.findOne({
      where: { id, user_id }
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found or access denied." });
    }

    // Delete address
    await address.destroy();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting address:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};