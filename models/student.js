const mongoose = require("mongoose");

const studSchema = new mongoose.Schema({
    studId : Number,
    name : String,
    email : String,
    phone : Number,
    password : String,
    branch : String
})

const Student = mongoose.model("student",studSchema);

module.exports = Student;