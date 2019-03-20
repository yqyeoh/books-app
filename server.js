const mongoose = require("mongoose");
const app = require("./app");

// only run this line in development (cuz in production already have port & mongodbUri)
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// const port = process.env.PORT || 8081;
const port = process.env.PORT;
const mongodbUri = process.env.MONGODB_URI;

// let mongodbUri = "mongodb://localhost/books"

// if (process.env.NODE_ENV === "production"){
//   mongodbUri = process.env.MONGODB_URI
// }

// connect to db
mongoose.connect(mongodbUri, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", error => {
  console.error("unable to connect to database", error);
});

db.once("connected", function() {
  console.log("successfully connected to database!");
  app.listen(port, () => {
    if (process.env.NODE_ENV === "production") {
      console.log(`server is running on heroku with port number ${port}`);
    }
    console.log(`server is running on port ${port}`);
  });
});
