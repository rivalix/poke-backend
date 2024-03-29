const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
require("dotenv/config");

const usertRouter = require("./routers/users");

//Middleware
app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(
  process.env.UPLOAD_DIR,
  express.static(__dirname + process.env.UPLOAD_DIR)
);

//Routers
const API = process.env.API_URL;
app.use(`${API}/users`, usertRouter);

try {
  mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
      console.log("Database connection ready.");
    })
    .catch((error) => {
      console.log("ERROR ON CONNECTON DB ", error);
    });
} catch (error) {
  console.log("ERROR ON CONNECTON DB CATCH ", error);
}
app.get("/", (req, res) => {
  res.json({ messsage: "It Works" });
});
app.listen(3000, () => {
  console.log("Server in running on PORT ", 3000);
});
