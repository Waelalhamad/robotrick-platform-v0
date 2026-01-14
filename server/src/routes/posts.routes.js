const router = require("express").Router();
const { protect, restrictTo } = require("../middleware/auth");
const {
  listPublished,
  getPost,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/posts.controller");

router.get("/", listPublished);

router.get("/:id", getPost);

router.post(
  "/",
  protect,
  restrictTo("editor", "admin", "superadmin"),
  createPost
);

router.put(
  "/:id",
  protect,
  restrictTo("editor", "admin", "superadmin"),
  updatePost
);

router.delete(
  "/:id",
  protect,
  restrictTo("editor", "admin", "superadmin"),
  deletePost
);

module.exports = router;
