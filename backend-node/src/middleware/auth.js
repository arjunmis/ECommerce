import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User no longer exists" });
    next();
  } catch {
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
}

export function admin(req, res, next) {
  if (req.user?.isAdmin) return next();
  res.status(403).json({ message: "Admin access only" });
}
