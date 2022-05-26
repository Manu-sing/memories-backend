const config = require("./utils/config");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");
const mongoose = require("mongoose");
const postsRouter = require("./controllers/posts");
const signinRouter = require("./controllers/signin"); // const signinRouter = require("./controllers/signin");
const usersRouter = require("./controllers/users");

logger.info("connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connecting to MongoDB:", error.message);
  });

app.use(cors());
app.use(bodyParser.json({ limit: "100mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use(express.json());
app.use("/api/posts", postsRouter);
app.use("/api/signin", signinRouter);
app.use("/api/users", usersRouter);
app.use(express.static("build"));
app.use(middleware.unknownEndpoint);

module.exports = app;
