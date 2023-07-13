const jimp = require("jimp");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs").promises;
const shortid = require("shortid");
const nodemailer = require("nodemailer");

const AVATAR_PATH = "/avatars/";

const sendToken = async ({ email, verificationToken }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.meta.ua",
    port: 465,
    secure: true,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: "tonyako23@meta.ua",
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  return transporter.sendMail({
    from: "tonyako23@meta.ua", // sender address
    to: email, // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: `<b><a href="http://localhost:3000/users/verify/${verificationToken}">Click to confirn your email</a></b>`, // html body
  });
};

const registerUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.status(409).json({ message: "Email in use" });
  }
  const avatarURL = await gravatar.url(email, {}, false);
  const verificationToken = shortid.generate();

  const { subscription } = await User.create({
    email,
    password,
    avatarURL,
    verificationToken,
  });

  try {
    await sendToken({ email, verificationToken });
  } catch (error) {
    console.log("error", error);
  }
  res.status(201).json({
    user: {
      email,
      subscription,
    },
  });
});

const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const match = await bcrypt.compare(password, user.password);
  if (!user || !match) {
    return res.status(401).json({ message: "Email or password is wrong" });
  }
  const payload = {
    id: user._id,
    email: user.email,
    subscription: user.subscription,
    avatarURL: user.avatarURL,
  };
  const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "1d" });
  await User.findByIdAndUpdate(user._id, { token });
  res.status(200).json({
    token,
    user: payload,
  });
});

const currentUser = catchAsync(async (req, res) => {
  const { email, subscription } = req.user;

  res.status(200).json({
    user: { email, subscription },
  });
});

const logoutUser = catchAsync(async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).json();
});

const changeAvatar = catchAsync(async (req, res, next) => {
  const { path: temporaryName, originalname } = req.file;
  try {
    const image = await jimp.read(temporaryName);
    await image.resize(250, 250);

    const fileExtension = originalname.slice(originalname.indexOf("."));
    const fileName = `${shortid.generate()}${fileExtension}`;
    const fullFileName = path.join(process.env.PATH_USER_AVATARS, fileName);

    await image.writeAsync(fullFileName);
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatarURL: AVATAR_PATH + fileName,
      },
      { new: true }
    );
    await fs.unlink(temporaryName);
    const oldFileName = req.user.avatarURL.slice(AVATAR_PATH.length);
    await fs.unlink(path.join(process.env.PATH_USER_AVATARS, oldFileName));
    res.status(200).json({
      avatarURL: updatedUser.avatarURL,
    });
  } catch (err) {
    await fs.unlink(temporaryName);
    return next(err);
  }
});

const verifyToken = catchAsync(async (req, res, next) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user || !verificationToken) {
    return res.status(404).json({ message: "User not found" });
  }
  try {
    await User.findOneAndUpdate(
      user._id,
      {
        verificationToken: null,
        verify: true,
      },
      { new: true }
    );
    return res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

const resendVerificationCode = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user.verify) {
    return res
      .status(400)
      .json({ message: "Verification has already been passed" });
  }

  try {
    await sendToken({ email, verificationToken: user.verificationToken });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(200).json({ message: "Verification email sent" });
});

module.exports = {
  registerUser,
  loginUser,
  currentUser,
  logoutUser,
  changeAvatar,
  verifyToken,
  resendVerificationCode,
};
