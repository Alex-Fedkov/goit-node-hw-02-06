const jimp = require("jimp");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs").promises;
const shortid = require("shortid");

const AVATAR_PATH = "/avatars/";

const registerUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.status(409).json({ message: "Email in use" });
  }
  const avatarURL = await gravatar.url(email, {}, false);

  const { subscription } = await User.create({ email, password, avatarURL });
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
  console.log("user", user);
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
    console.log("oldFileName", oldFileName);
    await fs.unlink(path.join(process.env.PATH_USER_AVATARS, oldFileName));
    res.status(200).json({
      avatarURL: updatedUser.avatarURL,
    });
  } catch (err) {
    await fs.unlink(temporaryName);
    return next(err);
  }
});

module.exports = {
  registerUser,
  loginUser,
  currentUser,
  logoutUser,
  changeAvatar,
};
