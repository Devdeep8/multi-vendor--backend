const { verifyToken, generateAccessToken } = require("../../services/generateToken");
const db = require("../../../config/database");
const User = db.User;

const jwt = require('jsonwebtoken');
exports.getCurrentUser = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.refreshToken = async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refresh_token , process.env.REFRESH_SECRET_KEY);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Access token: valid for 1 day
    const access_token = generateAccessToken(user);

    res.json({ access_token, user });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};
