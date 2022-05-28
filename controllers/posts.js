const postsRouter = require("express").Router();
const Post = require("../models/post");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const authorizeUser = require("../utils/middleware");

const getTokenFrom = (req) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7);
  }
  return null;
};

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

postsRouter.post("/", async (req, res, next) => {
  const post = req.body;

  const token = getTokenFrom(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }
  const user = await User.findById(decodedToken.id);
  const newPost = new Post({ ...post, user: user._id });
  // we will pass in the value that we are receiving from the frontend form

  newPost
    .save()
    .then((savedPost) => {
      user.posts = user.posts.concat(savedPost._id);
      user.save();
      res.json(savedPost);
    })
    .catch((error) => next(error));
});

postsRouter.put("/:id", async (req, res, next) => {
  const post = req.body;

  const token = getTokenFrom(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }

  const postToEdit = await Post.findById(req.params.id);
  if (postToEdit.user.toString() === decodedToken.id.toString()) {
    Post.findByIdAndUpdate(req.params.id, post, { new: true })
      .then((updatedPost) => {
        res.json(updatedPost);
      })
      .catch((error) => next(error));
  }
  // if (!mongoose.Types.ObjectId.isValid(id))
  //   return response.status(404).send("No post with that id");
});

postsRouter.delete("/:id", async (req, res, next) => {
  const token = getTokenFrom(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }

  const post = await Post.findById(req.params.id);
  // const user = await User.findById(post.user);

  if (post.user.toString() === decodedToken.id.toString()) {
    await User.findByIdAndUpdate(
      { _id: post.user },
      { $pull: { posts: post._id } }
    );
    await Post.findByIdAndRemove(req.params.id)
      .then(() => {
        res.status(204).end();
      })
      .catch((error) => next(error));
  }
});

module.exports = postsRouter;
