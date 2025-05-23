const mongoose = require("mongoose");

const timeTableSchema = new mongoose.Schema({
    time : String,
    subject : String,
    subLocation : String
  })

const facSchema = new mongoose.Schema({
    facId : Number,
    name : String,
    email : String,
    password : String,
    role : String,
    areaOfInterest : String,
    phone : Number,
    Monday : [timeTableSchema],
    Tuesday : [timeTableSchema],
    Wednesday : [timeTableSchema],
    Thursday : [timeTableSchema],
    Friday : [timeTableSchema],
    Saturday : [timeTableSchema]
  })
  
const Faculty = mongoose.model("faculty",facSchema);

module.exports = Faculty;