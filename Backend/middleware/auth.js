import jwt from "jsonwebtoken";
import { logSecurityEvent } from "./security.js";

const auth = (req, res, next) => {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    // Validate token format
    if (
      typeof token !== "string" ||
      !token.match(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
    ) {
      throw new Error("Invalid token format");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify token structure
    if (!decoded.user || !decoded.user.id) {
      throw new Error("Invalid token payload");
    }

    // Additional security: verify token hasn't been tampered with
    if (!decoded.iat || !decoded.exp) {
      throw new Error("Token missing required claims");
    }

    req.user = decoded.user;
    next();
  } catch (err) {
    logSecurityEvent("token_validation_failed", {
      error: err.message,
      ipAddress: req.ip,
    }).catch(console.error);

    // Don't expose token errors to client for security
    res.status(401).json({ msg: "Token is not valid" });
  }
};

export default auth;
