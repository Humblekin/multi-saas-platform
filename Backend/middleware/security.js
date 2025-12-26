import { db } from "../firebaseAdmin.js";

/**
 * Account Lockout Middleware
 * Tracks failed login attempts and locks accounts after 5 failed attempts
 * Lock duration: 15 minutes
 */
export const checkAccountLockout = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next();
    }

    // Get login attempts record
    const attemptsRef = db.collection("loginAttempts").doc(email);
    const attemptsDoc = await attemptsRef.get();

    if (attemptsDoc.exists) {
      const data = attemptsDoc.data();
      const now = new Date();
      const lockoutExpiry = new Date(data.lockedUntil);

      // Check if account is locked
      if (data.isLocked && now < lockoutExpiry) {
        const minutesRemaining = Math.ceil((lockoutExpiry - now) / (1000 * 60));
        return res.status(429).json({
          msg: `Account locked due to too many failed attempts. Try again in ${minutesRemaining} minutes.`,
          accountLocked: true,
          minutesRemaining,
        });
      }

      // Reset lock if expired
      if (data.isLocked && now >= lockoutExpiry) {
        await attemptsRef.update({
          isLocked: false,
          failedAttempts: 0,
          lockedUntil: null,
        });
      }
    }

    next();
  } catch (err) {
    console.error("Account lockout check error:", err);
    next(); // Continue even if check fails
  }
};

/**
 * Record Failed Login Attempt
 * Increments failed attempt counter and locks account after 5 attempts
 */
export const recordFailedLogin = async (email) => {
  try {
    if (!email) return;

    const attemptsRef = db.collection("loginAttempts").doc(email);
    const attemptsDoc = await attemptsRef.get();
    const now = new Date();
    const lockoutDuration = 15 * 60 * 1000; // 15 minutes

    if (!attemptsDoc.exists) {
      // First failed attempt
      await attemptsRef.set({
        email,
        failedAttempts: 1,
        isLocked: false,
        lastAttempt: now.toISOString(),
        lockedUntil: null,
        createdAt: now.toISOString(),
      });
    } else {
      const data = attemptsDoc.data();
      const lastAttempt = new Date(data.lastAttempt);
      const timeSinceLastAttempt = now - lastAttempt;
      const resetThreshold = 30 * 60 * 1000; // Reset counter after 30 mins of inactivity

      let newFailedAttempts =
        timeSinceLastAttempt > resetThreshold ? 1 : data.failedAttempts + 1;
      let isLocked = newFailedAttempts >= 5;
      let lockedUntil = isLocked
        ? new Date(now.getTime() + lockoutDuration)
        : null;

      await attemptsRef.update({
        failedAttempts: newFailedAttempts,
        isLocked,
        lastAttempt: now.toISOString(),
        lockedUntil: lockedUntil ? lockedUntil.toISOString() : null,
      });
    }
  } catch (err) {
    console.error("Error recording failed login:", err);
  }
};

/**
 * Clear Login Attempts on Successful Login
 */
export const clearLoginAttempts = async (email) => {
  try {
    if (!email) return;

    const attemptsRef = db.collection("loginAttempts").doc(email);
    await attemptsRef.update({
      failedAttempts: 0,
      isLocked: false,
      lastAttempt: new Date().toISOString(),
      lockedUntil: null,
    });
  } catch (err) {
    console.error("Error clearing login attempts:", err);
  }
};

/**
 * Input Validation and Sanitization
 * Prevents XSS, NoSQL injection, and other attacks
 */
export const validateAndSanitizeInput = (input, type = "email") => {
  if (typeof input !== "string") {
    return null;
  }

  // Remove leading/trailing whitespace
  let sanitized = input.trim();

  switch (type) {
    case "email":
      // Basic email validation
      const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
      if (!emailRegex.test(sanitized)) {
        return null;
      }
      return sanitized.toLowerCase();

    case "token":
      // Token should be alphanumeric and specific length range
      if (!/^[a-zA-Z0-9._-]+$/.test(sanitized)) {
        return null;
      }
      return sanitized;

    case "text":
      // Remove any potential script/HTML tags
      sanitized = sanitized.replace(/<[^>]*>/g, "");
      // Remove control characters
      sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");
      return sanitized.substring(0, 500); // Limit length

    default:
      return sanitized;
  }
};

/**
 * Validate Firebase Token Structure
 */
export const validateTokenStructure = (token) => {
  if (typeof token !== "string") {
    return false;
  }

  // Firebase tokens are JWT format: header.payload.signature
  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  // Basic validation that each part is base64url encoded
  const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
  return parts.every((part) => base64UrlRegex.test(part));
};

/**
 * Security Event Logging
 * Logs suspicious activities for monitoring
 */
export const logSecurityEvent = async (eventType, details) => {
  try {
    const logsRef = db.collection("securityLogs");
    await logsRef.add({
      eventType, // 'failed_login', 'account_locked', 'token_invalid', etc.
      details,
      timestamp: new Date().toISOString(),
      ipAddress: details.ipAddress || "unknown",
    });
  } catch (err) {
    console.error("Error logging security event:", err);
  }
};
