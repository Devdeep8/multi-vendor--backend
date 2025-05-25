const express = require("express")

const router = express.Router()

const { uploads } = require("../../middleware/multer")
const { userRegistration } = require("../../controllers/user_controller/registration.controller")
const { login } = require("../../controllers/user_controller/login.controller")
const {getCurrentUser} = require("../../controllers/user_controller/getUser.controller")
const {refreshToken} = require("../../controllers/user_controller/getUser.controller")


router.post("/login", login)
router.post("/registration",uploads.single("profileImage"),  userRegistration)
router.get("/current-user", getCurrentUser)
router.get("/refresh-token" , refreshToken)
// router.post("/forget-password", forgetPassword)
// router.post("/reset-password", resetPassword)
module.exports = router