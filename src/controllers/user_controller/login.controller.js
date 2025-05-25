const db = require("../../../config/database");
const User = db.User;
const bcrypt = require("bcryptjs");
const tokenProcess = require("../../services/generateToken");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Trim inputs
        const trimmedEmail = email?.trim();
        const trimmedPassword = password?.trim();

        // Validate input
        if (!trimmedEmail || !trimmedPassword) {
            return res.status(400).json({
                status: false,
                message: "Please provide both email and password.",
            });
        }

        // Find user in the database
        const user = await User.findOne({ where: { email: trimmedEmail } });
        if (!user) {
            return res.status(401).json({
                status: false,
                message: "Invalid email or password. Please try again.",
            });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(trimmedPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: false,
                message: "Invalid email or password. Please try again.",
            });
        }

        // Generate tokens
        const access_token = tokenProcess.generateAccessToken(user);
        const refresh_token = tokenProcess.generateRefreshToken(user);
        const refreshTokenExpiration = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

        // Save refresh token
        user.refreshToken = refresh_token;
        user.refreshToken_Expiration = refreshTokenExpiration;
        await user.save();
        return res.status(200).json({
            status: true,
            message: "Login successful!",
            access_token,
            refresh_token,
            userType:user.role,
            userId:user.id,
            userName:user.name,
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            status: false,
            message: "An error occurred during login. Please try again later.",
        });
    }
};

module.exports = {
  login,
};
