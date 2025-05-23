const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    name : String,
    date : {type : Date, expires: "86400s", default : Date.now},
    description : String
});

// var evtDate = Date.parse(eventSchema.date);

// var now = Date.now();

// var sub = evtDate - now ;

// eventSchema.index({createdAt : 1}, {expireAfterSeconds: 86400});

const Event = mongoose.model("event",eventSchema);

module.exports = Event;