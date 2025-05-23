const mongoose = require("mongoose");

const facultyEventSchema = new mongoose.Schema({
    name : String,
    date : {type : Date, expires: "86400s", default : Date.now},
    description : String,
    addedBy : String
});

const FacultyEvent = mongoose.model("facultyEvent",facultyEventSchema);

module.exports = FacultyEvent;