const express = require("express");
const {
  registerUser,
  loginUser,
  currentUser,
  logoutUser,
} = require("../../controllers/users");
const { auth } = require("../../middlewares/userMiddlewares");

const validate = require("./validation-users");

const router = express.Router();

router.post("/register", validate.registration, registerUser);
router.post("/login", validate.login, loginUser);
router.get("/current", auth, currentUser);
router.post("/logout", auth, logoutUser);

module.exports = router;
