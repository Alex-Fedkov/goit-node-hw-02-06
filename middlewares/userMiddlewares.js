const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { userDataValidator } = require("../utils/userValidators");
const User = require("../models/userModel");

exports.checkCreateUserData = catchAsync(async (req, res, next) => {
  const { error, value } = userDataValidator(req.body);
  if (error) return next(new AppError(400, "Bad Request"));
  req.body = value;
  next();
});

exports.auth = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");
  try {
    if (bearer !== "Bearer") {
      return next(new AppError(401, "Not authorized"));
    }
    const { id } = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(id);
    if (!user || !user.token) {
      return next(new AppError(401, "Not authorized"));
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.message === "invalid signature") {
      error.status = 401;
    }
    next(error);
  }
};
