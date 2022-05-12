import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import postRoutes from "./routes/posts.js";

const app = express();

app.use("/posts", postRoutes); // every route inside of the postRoutes is going to start with "/posts"
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

app.use(cors());

const CONNECTION_URL =
  "mongodb+srv://Manu-sing:Manu831gallo@cluster0.ru6ma.mongodb.net/memories-app?retryWrites=true&w=majority";
// later we will secure the password with .env

const PORT = process.env.PORT || 5000; // for now we will use port 5000 but then, when we deploy the whole app to heroku, it will automatically going to populate environmental variable called port

mongoose
  .connect(CONNECTION_URL)
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
