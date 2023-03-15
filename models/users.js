var mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      validation: {
        validator: function (v) {
          return v.length > 3;
        }
      }
    },
    phone: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      validation: {
        validator: function (v) {
          return v.length > 9;
        }
      }
    },
    password: {
      type: String,
      trim: true,
      validation: {
        validator: function (v) {
          return v.length > 6;
        },
        message: "Password must be at least 6 characters long",
      },
    }
  }
);

let users = mongoose.model("users", userSchema);

insertOne = async (query) => {
  try{
      const get = await users(query).save();
      return get;
  }catch (err) {
      return err
  }
}

find = async () => {
  try{
      const get = await users.find();
      return get;
  }catch (err) {
      return err
  }
}

findOne = async (query) => {
  try{
      const get = await users.findOne(query);
      return get;
  }catch (err) {
    return err
  }
}

count = async (query) => {
  try{
      const get = await users.count(query);
      return get;
  }catch (err) {
    return err
  }
}

module.exports = {
  insertOne,
  find,
  findOne,
  count
}