const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    adminId : Number,
    password : String
  })
  const Admin = mongoose.model("admin",adminSchema);

//   const admin = new Admin({
//     adminId : 1523,
//     password: "qwerty"
//   })
  // admin.save();
  
module.exports = Admin;