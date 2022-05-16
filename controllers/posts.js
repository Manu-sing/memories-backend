const postsRouter = require("express").Router();
const { default: mongoose } = require("mongoose");
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

postsRouter.put("/:id", async (request, response) => {
  const post = request.body;

  // if (!mongoose.Types.ObjectId.isValid(id))
  //   return response.status(404).send("No post with that id");

  const savedPost = await Post.findByIdAndUpdate(request.params.id, post, {
    new: true,
  });
  response.json(savedPost);
});

postsRouter.delete("/:id", async (request, response) => {
  try {
    await Post.findByIdAndRemove(request.params.id);
    response.status(204).end();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = postsRouter;
