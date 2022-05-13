require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const url = process.env.MONGODB_URI;
const postsRouter = require("./controllers/posts");
const middleware = require("./utils/middleware");
const app = express();

mongoose
  .connect(url)
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

app.use(express.json());
app.use(cors());
app.use("/api/posts", postsRouter);
// app.use(express.json({ limit: "30mb", extended: true }));
// app.use(express.urlencoded({ limit: "30mb", extended: true }));

app.use(middleware.unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
