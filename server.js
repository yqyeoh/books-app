const app = require("./app");

const port = process.env.PORT || 8081;

app.listen(port, () => {
  if (process.env.NODE_ENV === "production") {
    console.log(`server is running on heroku with port number ${port}`);
  }
  console.log(`server is running on port ${port}`);
});
