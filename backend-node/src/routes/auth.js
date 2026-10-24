import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
});

// POST /api/auth/register
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const user = await User.create({ name, email, password });
    res.status(201).json({ user: publicUser(user), token: signToken(user) });
  })
);

// POST /api/auth/login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user || !(await user.matchPassword(password || ""))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ user: publicUser(user), token: signToken(user) });
  })
);

// GET /api/auth/me
router.get("/me", protect, (req, res) => res.json(publicUser(req.user)));

export default router;
