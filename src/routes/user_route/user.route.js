const express = require("express")

const router = express.Router()

const { uploads } = require("../../middleware/multer")
const { userRegistration } = require("../../controllers/user_controller/registration.controller")
const { login } = require("../../controllers/user_controller/login.controller")
router.post("/registration",uploads.single("profileImage"),  userRegistration)
router.post("/login", login)
// router.post("/forget-password", forgetPassword)
// router.post("/reset-password", resetPassword)
module.exports = router