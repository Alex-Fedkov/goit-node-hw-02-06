const express = require("express");
const {
  registerUser,
  loginUser,
  currentUser,
  logoutUser,
  changeAvatar,
  verifyToken,
  resendVerificationCode,
} = require("../../controllers/users");
const { auth } = require("../../middlewares/userMiddlewares");
const multer = require("multer");
const path = require("path");
const uploadDir = path.join(process.cwd(), "tmp");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  limits: {
    fileSize: 1048576,
  },
});

const upload = multer({
  storage: storage,
});

const validate = require("./validation-users");

const router = express.Router();

router.post("/register", validate.registration, registerUser);
router.post("/login", validate.login, loginUser);
router.get("/current", auth, currentUser);
router.post("/logout", auth, logoutUser);
router.patch("/avatars", auth, upload.single("avatar"), changeAvatar);
router.post("/verify", validate.resendEmail, resendVerificationCode);
router.get("/verify/:verificationToken", verifyToken);

module.exports = router;
