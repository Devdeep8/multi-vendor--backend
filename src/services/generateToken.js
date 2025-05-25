const jwt = require("jsonwebtoken")
const access_secret_key = process.env.ACCESS_SECRET_KEY
const refresh_secret_key = process.env.REFRESH_SECRET_KEY

const generateAccessToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        type: user.role,
    };
    return jwt.sign(payload, access_secret_key, { expiresIn: '1d' });
};

const generateRefreshToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        type: user.role,
    };

    return jwt.sign(payload, refresh_secret_key, { expiresIn: '7d' });
};

const generateToken = (payload, expiresIn) => {
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn });
  };
  
const verifyToken = (token) => {
    try {
      return jwt.verify(token, process.env.access_secret_key);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  };
  
module.exports = { generateAccessToken, generateRefreshToken ,generateToken, verifyToken}