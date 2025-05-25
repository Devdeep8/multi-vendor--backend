const db = require("../../../config/database")
const User = db.User;
const bcrypt = require("bcryptjs");

const userRegistration = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      password,
      role = "user",
    } = req.body;

    // Validate required fields
    if (!name || !phone || !email || !password || !role) {
      return res.status(400).json({
        status: false,
        message: "Please do not leave empty fields",
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      phone,
      email,
      password: hashedPassword,
      role,
      profileImage: req.file ? `profileImage/${req.file.filename}` : null,
    });

    return res.status(200).json({
      status: true,
      message: "Registration successful",
      data: newUser,
    });

  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({
      status: false,
      message: "An error occurred during registration.",
      error: error.message,
    });
  }
};

module.exports = {
  userRegistration,
};
