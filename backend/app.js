const express = require("express");
const cors = require("cors");
const path = require("path");
const authRouter = require("./routes/auth");

const app = express();

//incoming request parser
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve frontend static files (adjust path if you serve differently)
app.use(express.static(path.resolve(__dirname, "..", "frontend")));

// mount API
app.use("/api/auth", authRouter);

// simple health route
app.get("/health", (req, res) => res.json({ ok: true }));

// fallback to index.html for SPA navigations (optional)
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "frontend", "login.html"));
});

module.exports = app;