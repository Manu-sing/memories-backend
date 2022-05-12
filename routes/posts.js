// here we will add all the routes that have to do with posts
import express from "express";
const router = express.Router();
import { getPosts, createPosts } from "../controllers/posts.js";

router.get("/", getPosts);
router.post("/", createPosts);

export default router;
