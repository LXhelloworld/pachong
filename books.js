let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let bookSchema = new Schema({
    "name":String,
    "url":String,
});

module.exports = mongoose.model("book",bookSchema);