const postsRouter = require("express").Router();
const Post = require("../models/post");

postsRouter.get("/", async (req, res) => {
  try {
    const postMessages = await Post.find({});
    res.status(200).json(postMessages);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

postsRouter.post("/", async (req, res) => {
  const post = req.body;
  const newPost = new Post(post); // we will pass in the value that we are receiving from the frontend form

  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
});

module.exports = postsRouter;
