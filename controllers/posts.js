const postsRouter = require("express").Router();
const Post = require("../models/post");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { auth } = require("../utils/middleware");

postsRouter.get("/", async (req, res) => {
  Post.find({}).then((posts) => {
    res.json(posts);
  });
});

postsRouter.get("/:id", async (req, res, next) => {
  Post.findById(req.params.id)
    .then((post) => {
      if (post) {
        res.json(post);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

postsRouter.post("/", auth, async (req, res, next) => {
  // the req.userId has been defined in the auth middleware function for custom users
  // the req.googleId has been defined in the auth middleware function for google users
  const post = req.body;
  try {
    const user = await User.findById(req.userId);
    const newPost = new Post({ ...post, user: user._id });
    if (
      newPost.creator === "" ||
      newPost.title === "" ||
      newPost.message === ""
    ) {
      console.log("The fields creator, title and message must be provided.");
      return;
    }

    const savedPost = await newPost.save();
    user.posts = user.posts.concat(savedPost._id);
    await user.save();
    res.json(savedPost.toJSON());
  } catch (error) {
    next(error);
  }
});

postsRouter.put("/:id", auth, async (req, res, next) => {
  const post = req.body;
  // the req.userId has been defined in the auth middleware function

  try {
    const postToEdit = await Post.findById(req.params.id);
    if (postToEdit.user.toString() === req.userId.toString()) {
      Post.findByIdAndUpdate(req.params.id, post, { new: true }).then(
        (updatedPost) => {
          res.json(updatedPost);
        }
      );
    }
  } catch (error) {
    next(error);
  }
});

postsRouter.delete("/:id", auth, async (req, res, next) => {
  // the req.userId has been defined in the auth middleware function
  try {
    const post = await Post.findById(req.params.id);
    if (post.user.toString() === req.userId.toString()) {
      await User.findByIdAndUpdate(
        { _id: post.user },
        { $pull: { posts: post._id } }
      );
      await Post.findByIdAndRemove(req.params.id);
      res.status(204).end();
    }
  } catch (error) {
    next(error);
  }
});

module.exports = postsRouter;
