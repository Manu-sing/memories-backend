const postsRouter = require("express").Router();
const Post = require("../models/post");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { auth } = require("../utils/middleware");

// const getTokenFrom = (req) => {
//   const authorization = req.get("authorization");
//   if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
//     return authorization.substring(7);
//   }
//   return null;
// };

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
  try {
    const post = req.body;
    const user = await User.findById(req.user.id);
    const newPost = new Post({ ...post, user: user._id });
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
  const authorization = req.get("Authorization");
  const token = authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.SECRET);
  try {
    const postToEdit = await Post.findById(req.params.id);
    if (postToEdit.user.toString() === decoded.id.toString()) {
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
  const authorization = req.get("Authorization");
  const token = authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.SECRET);
  try {
    const post = await Post.findById(req.params.id);
    if (post.user.toString() === decoded.id.toString()) {
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

  // const token = getTokenFrom(req);
  // const decodedToken = jwt.verify(token, process.env.SECRET);
  // if (!decodedToken.id) {
  //   return response.status(401).json({ error: "token missing or invalid" });
  // }

  // const post = await Post.findById(req.params.id);
  // // const user = await User.findById(post.user);

  // if (post.user.toString() === decodedToken.id.toString()) {
  //   await User.findByIdAndUpdate(
  //     { _id: post.user },
  //     { $pull: { posts: post._id } }
  //   );
  //   await Post.findByIdAndRemove(req.params.id)
  //     .then(() => {
  //       res.status(204).end();
  //     })
  //     .catch((error) => next(error));
  // }
});

module.exports = postsRouter;
