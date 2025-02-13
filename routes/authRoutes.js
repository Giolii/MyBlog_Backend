const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      id: user.id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    // Can be email or password
    const { email, password } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { username: email }],
      },
    });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid credentials, user not found" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res
        .status(401)
        .json({ message: "Invalid credentials, password doesn't match" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

router.get("/guest", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: "Guest",
      },
    });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid credentials, user not found" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

module.exports = router;
