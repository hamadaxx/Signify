const mongoose = require("mongoose");
require("dotenv").config();
const MONGO_URL = process.env.MONGO_URL;
// const MONGO_URL = process.env.MONGO_CONTAINER_URL;

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Connected To Database");
  })

  .catch((err) => {
    console.log(err);
  });

module.exports = mongoose;