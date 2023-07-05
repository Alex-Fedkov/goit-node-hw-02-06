const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

const registerUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.status(409).json({ message: "Email in use" });
  }
  const { subscription } = await User.create({ email, password });
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
  };
  const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "1d" });
  user.password = undefined;
  await User.findByIdAndUpdate(user._id, { token });
  res.status(200).json({
    token,
    user,
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

module.exports = {
  registerUser,
  loginUser,
  currentUser,
  logoutUser,
};
