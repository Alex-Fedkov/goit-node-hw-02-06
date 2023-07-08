const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.auth = async (req, res, next) => {
  console.log("auth");
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");
  try {
    if (bearer !== "Bearer") {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Not authorized",
        data: "Not authorized",
      });
    }
    const { id } = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(id);
    if (!user || !user.token) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Not authorized",
        data: "Not authorized",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("error", error);
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Not authorized",
      data: "Not authorized",
    });
  }
};
