const postsRouter = require("express").Router();
const { default: mongoose } = require("mongoose");
const Post = require("../models/post");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const getTokenFrom = (req) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7);
  }
  console.log("there is not token");
  return null;
};

postsRouter.get("/", async (req, res) => {
  try {
    const postMessages = await Post.find({});
    res.status(200).json(postMessages);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

postsRouter.post("/", async (req, res) => {
  const post = req.body;

  const token = getTokenFrom(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!decodedToken.id) {
    return res.status(401).json({ error: "token missing or invalid" });
  }
  const user = await User.findById(decodedToken.id);

  const newPost = new Post({ ...post, user: user._id }); // we will pass in the value that we are receiving from the frontend form

  try {
    const savedPost = await newPost.save();
    user.posts = user.posts.concat(savedPost._id);
    await user.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
});

postsRouter.put("/:id", async (req, res) => {
  const post = req.body;

  // if (!mongoose.Types.ObjectId.isValid(id))
  //   return response.status(404).send("No post with that id");

  const savedPost = await Post.findByIdAndUpdate(req.params.id, post, {
    new: true,
  });
  res.json(savedPost);
});

postsRouter.delete("/:id", async (req, res) => {
  const token = getTokenFrom(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!decodedToken.id) {
    return res.status(401).json({ error: "token missing or invalid" });
  }

  const post = await Post.findById(req.params.id);
  const user = await User.findById(decodedToken.id);

  if (post.user.toString() === decodedToken.id.toString()) {
    await Post.findByIdAndRemove(req.params.id);
    user.posts = user.posts.filter((p) => p !== post._id);
    res.status(204).end();
  } else {
    res.status(400).end();
  }
});

module.exports = postsRouter;
