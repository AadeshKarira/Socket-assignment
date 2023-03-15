const jwt = require("jsonwebtoken");
const UserModel = require("../models/users");

isValidToken = async (req, res, next) => {
  //check if authentication header exists
  if(req.headers.authorization)
  {
      const token = req.headers.authorization.split(" ")[1]; //get the token

      try
      {
        const decode = await jwt.verify(token, process.env.JWT_KEY);
        const user = await UserModel.findOne({
          _id: decode._id,
          name: decode.name,
          phone: decode.phone,
        }).catch((err) => {
          return false;
        });
        if (user) {
          req["user"] = user;
          req["AuthenticateUser"].type = "user";
          next();
        } else {
          return res.status(401).json({
            status: false,
            msg: "Unauthorized! Please login",
          });
        }
      }
      catch(error)
      {
        return res.status(401).json({
          status: false,
          msg: "Unauthorized! Please login",
        });
      }
  }
  else
  {
    return res.status(401).json({
      status: false,
      msg: "Unauthorized! Please login",
    });
  }
};

module.exports = {
  isValidToken
};
