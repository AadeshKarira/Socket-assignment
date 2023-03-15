const jwt = require('jsonwebtoken');
exports.create_token = async (data) => {
    try{
        let token = jwt.sign(data,process.env.JWT_KEY,{expiresIn:"30d"});
        return token;
    }catch (err) {
        return err
    }
  }
  