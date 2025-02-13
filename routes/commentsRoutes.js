const { PrismaClient } = require("@prisma/client");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const authenticateJWT = passport.authenticate("jwt", { session: false });

const prisma = new PrismaClient();

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const comment = await prisma.comment.findUnique({
      where: {
        id: id,
      },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    return res.status(200).json(comment);
  } catch (error) {
    console.error("Error fetching comment:", error);
    return res.status(500).json({ error: "Error while fetching comment" });
  }
});

router.post("/:postId", authenticateJWT, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const { title, content } = req.body;

    const comment = await prisma.comment.create({
      data: {
        title: title,
        content: content,
        postId: postId,
        userId: req.user.id,
      },
    });

    if (!comment) {
      return res.status(404).json({ message: "Error creating the comment" });
    }
    res.status(201).json({ comment });
  } catch (error) {
    console.error("Error creating the comment:", error);
    return res.status(500).json({ error: "Error while creating the comment" });
  }
});

router.put("/:id", authenticateJWT, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, content } = req.body;

    const existingComment = await prisma.comment.findUnique({
      where: {
        id: id,
      },
    });
    if (!existingComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (existingComment.userId !== req.user.id && !req.user.admin) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this comment" });
    }

    const comment = await prisma.comment.update({
      where: {
        id: id,
      },
      data: {
        ...(title && { title }),
        ...(content && { content }),
      },
    });
    return res.status(200).json({ comment });
  } catch (error) {
    console.error("Error updating comment:", error);
    return res.status(500).json({ error: "Error while updating comment" });
  }
});

router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existingComment = await prisma.comment.findUnique({
      where: {
        id: id,
      },
    });
    if (!existingComment) {
      return res.status(404).json({ message: "Comment to delete not found" });
    }
    if (existingComment.userId !== req.user.id && req.user.admin === false) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this comment" });
    }

    const comment = await prisma.comment.delete({
      where: {
        id: id,
      },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ error: "Error while deleting comment" });
  }
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

module.exports = router;
