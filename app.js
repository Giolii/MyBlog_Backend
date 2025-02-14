require("dotenv").config();

const express = require("express");
const passport = require("passport");
const authRoutes = require("./routes/authRoutes");
const postsRoutes = require("./routes/postsRoutes");
const commentsRoutes = require("./routes/commentsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cors = require("cors");

const app = express();

app.use(express.json());
require("./config/passport");
app.use(passport.initialize());
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    process.env.FRONTEND_URL2 || "http://localhost:3000",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
};
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.use("/auth", authRoutes);
app.use("/posts", postsRoutes);
app.use("/comments", commentsRoutes);
app.use("/admin", adminRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

const PORT = process.env.PORT || 3000;

testConnection().then((connected) => {
  if (connected) {
    console.log("Database connection verified");
  } else {
    console.log("Failed to verify database connection");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
