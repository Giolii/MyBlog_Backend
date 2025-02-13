const { PrismaClient } = require("@prisma/client");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const authenticateJWT = passport.authenticate("jwt", { session: false });
const rateLimit = require("express-rate-limit");

const prisma = new PrismaClient();
// Utility function to create artificial delay
// const simulateDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

router.get("/users", authenticateJWT, async (req, res) => {
  try {
    if (!req.user.admin)
      return res
        .status(403)
        .json({ message: "Not authorized to get the User List" });

    const result = await prisma.user.findMany({
      select: {
        username: true,
        admin: true,
        id: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!result || result.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error updating admin status:", error);
    return res.status(500).json({ error: "Error updating admin status" });
  }
});

router.put("/toggleStatus/:id", authenticateJWT, async (req, res) => {
  console.log(req.user.id);
  console.log(req.params.id);

  try {
    if (!req.user.admin)
      return res
        .status(403)
        .json({ message: "Not authorized to get the User List" });

    if (parseInt(req.params.id) === parseInt(req.user.id)) {
      return res.status(403).json({
        message: "Cannot modify your own admin status",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await prisma.user.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        admin: !user.admin,
      },
    });

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error updating admin status:", error);
    return res.status(500).json({ error: "Error updating admin status" });
  }
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

module.exports = router;
