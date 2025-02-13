const { PrismaClient } = require("@prisma/client");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const authenticateJWT = passport.authenticate("jwt", { session: false });

const prisma = new PrismaClient();
// Utility function to create artificial delay
const simulateDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

router.get("/", async (req, res) => {
  try {
    const result = await prisma.post.findMany({
      where: {
        published: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "No posts found" });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ error: "Error fetching posts" });
  }
});

// Fetch posts for Admin

router.get("/admin/:order", authenticateJWT, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!req.user.admin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const order = req.params.order;
    const status = req.query.option;

    if (!["asc", "desc"].includes(order)) {
      return res.status(400).json({ message: "Invalid order parameter" });
    }

    const query =
      status === "all"
        ? {
            orderBy: {
              createdAt: order,
            },
          }
        : {
            where: {
              published: status === "published" ? true : false,
            },
            orderBy: {
              createdAt: order,
            },
          };

    const result = await prisma.post.findMany(query);

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "No posts found" });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ error: "Error fetching posts" });
  }
});

router.get("/:id/comments", async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        postId: parseInt(req.params.id),
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ error: "Error while fetching comments" });
  }
});

router.post("/", authenticateJWT, async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;
    if (!title || !content || !userId) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        userId,
      },
    });
    return res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ error: "Error while creating post" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        user: true,
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching single post:", error);
    return res.status(500).json({ error: "Error while fetching single post" });
  }
});
router.put("/:id", authenticateJWT, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const existingPost = await prisma.post.findUnique({
      where: { id: id },
    });

    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (existingPost.userId !== req.user.id && !req.user.admin) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this post" });
    }

    const post = await prisma.post.update({
      where: { id: id },
      data: {
        title,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return res.status(200).json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({ error: "Error while updating post" });
  }
});
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existingPost = await prisma.post.findUnique({
      where: { id: id },
    });
    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (existingPost.userId !== req.user.id && !req.user.admin) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    const post = await prisma.post.delete({
      where: {
        id: id,
      },
    });
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post", error);
    return res.status(500).json({ error: "Error deleting post" });
  }
});

router.put("/:id/togglePublish", authenticateJWT, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!req.user.admin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const post = await prisma.post.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
      select: {
        published: true,
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const result = await prisma.post.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        published: !post.published,
      },
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error updating 'published' post:", error);
    return res
      .status(500)
      .json({ error: "Error updating Published field of post" });
  }
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

module.exports = router;
