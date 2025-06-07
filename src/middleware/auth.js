const jwt = require('jsonwebtoken');
const db = require('../../config/database');
const {verifyToken} = require('./../services/generateToken')
// Verify JWT token
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) { 
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }


    const token = authHeader.split(' ')[1];
    // console.log(token , "token");


    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    const decoded  = verifyToken(token);
    // console.log(decoded , "decoded");

    
    // Find user by ID
    const user = await db.User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.userType === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

// Check if user is seller
exports.isSeller = (req, res, next) => {
  if (req.user && (req.user.userType === 'seller' || req.user.userType === 'admin')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Seller privileges required.'
    });
  }
};