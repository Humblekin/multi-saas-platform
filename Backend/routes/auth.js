import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";
import { db, admin } from "../firebaseAdmin.js";
import {
  checkAccountLockout,
  recordFailedLogin,
  clearLoginAttempts,
  validateAndSanitizeInput,
  validateTokenStructure,
  logSecurityEvent,
} from "../middleware/security.js";
// Register - Enhanced Security
router.post(
  "/register",
  [
    check("name", "Name is required")
      .not()
      .isEmpty()
      .trim()
      .isLength({ min: 2, max: 100 }),
    check("token", "Token is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, token } = req.body;

    try {
      // Validate and sanitize name input
      const sanitizedName = validateAndSanitizeInput(name, "text");
      if (!sanitizedName || sanitizedName.length < 2) {
        await logSecurityEvent("invalid_registration_name", {
          name,
          ipAddress: req.ip,
        });
        return res
          .status(400)
          .json({ msg: "Name must be between 2-100 characters" });
      }

      // Validate token structure
      if (!validateTokenStructure(token)) {
        await logSecurityEvent("invalid_token_format_register", {
          name: sanitizedName,
          ipAddress: req.ip,
        });
        return res.status(400).json({ msg: "Invalid token format" });
      }

      if (!db || !admin)
        return res.status(500).json({ msg: "Firebase not initialized" });

      // Verify Firebase ID token with timeout
      let decodedToken;
      try {
        decodedToken = await Promise.race([
          admin.auth().verifyIdToken(token),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Token verification timeout")),
              10000
            )
          ),
        ]);
      } catch (tokenErr) {
        await logSecurityEvent("token_verification_failed_register", {
          name: sanitizedName,
          error: tokenErr.message,
          ipAddress: req.ip,
        });
        return res.status(401).json({ msg: "Authentication failed" });
      }

      const uid = decodedToken.uid;
      const email = decodedToken.email;

      // Validate email
      const sanitizedEmail = validateAndSanitizeInput(email, "email");
      if (!sanitizedEmail) {
        await logSecurityEvent("invalid_email_register", {
          email,
          ipAddress: req.ip,
        });
        return res.status(400).json({ msg: "Invalid email format" });
      }

      const usersRef = db.collection("users");
      const userDoc = await usersRef.doc(uid).get();

      if (userDoc.exists) {
        await logSecurityEvent("duplicate_registration", {
          uid,
          email: sanitizedEmail,
          ipAddress: req.ip,
        });
        return res.status(400).json({ msg: "User already exists" });
      }

      // Create a 30-day free trial subscription for all systems
      const trialStartDate = new Date();
      const trialEndDate = new Date(
        trialStartDate.getTime() + 30 * 24 * 60 * 60 * 1000
      );

      const newUser = {
        name: sanitizedName,
        email: sanitizedEmail,
        role: "user",
        subscription: {
          isActive: true,
          planType: "All", // 'All' means access to all systems: School, Pharmacy, Inventory, Office
          startDate: trialStartDate.toISOString(),
          endDate: trialEndDate.toISOString(),
          paymentReference: "TRIAL-" + uid.substring(0, 8),
          isTrial: true,
        },
        createdAt: new Date().toISOString(),
        lastLogin: null,
        loginAttempts: 0,
      };

      // Use the Firebase UID as the Firestore document ID
      await usersRef.doc(uid).set(newUser);

      // Clear any previous login attempts
      await clearLoginAttempts(sanitizedEmail);

      const payload = {
        user: {
          id: uid,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
        async (err, jwtToken) => {
          if (err) {
            await logSecurityEvent("jwt_generation_failed_register", {
              uid,
              error: err.message,
              ipAddress: req.ip,
            });
            return res.status(500).json({ msg: "Error generating token" });
          }

          // Log successful registration
          await logSecurityEvent("registration_success", {
            uid,
            email: sanitizedEmail,
            ipAddress: req.ip,
          });

          res.json({
            token: jwtToken,
            user: {
              id: uid,
              name: newUser.name,
              email: newUser.email,
              subscription: newUser.subscription,
            },
          });
        }
      );
    } catch (err) {
      console.error("Registration error:", err);
      await logSecurityEvent("registration_error", {
        name,
        error: err.message,
        ipAddress: req.ip,
      });
      res.status(500).json({
        msg: "Server error during registration",
      });
    }
  }
);

// Login - Enhanced Security
router.post(
  "/login",
  checkAccountLockout, // Check if account is locked
  [
    check("token", "Firebase Token is required").not().isEmpty(),
    check("email", "Email is required").isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, email } = req.body;

    try {
      // Validate and sanitize email input
      const sanitizedEmail = validateAndSanitizeInput(email, "email");
      if (!sanitizedEmail) {
        await logSecurityEvent("invalid_email_format", {
          email,
          ipAddress: req.ip,
        });
        return res.status(400).json({ msg: "Invalid email format" });
      }

      // Validate token structure
      if (!validateTokenStructure(token)) {
        await logSecurityEvent("invalid_token_format", {
          email: sanitizedEmail,
          ipAddress: req.ip,
        });
        await recordFailedLogin(sanitizedEmail);
        return res.status(400).json({ msg: "Invalid token format" });
      }

      if (!db || !admin)
        return res.status(500).json({ msg: "Firebase not initialized" });

      // Verify Firebase ID token with timeout
      let decodedToken;
      try {
        decodedToken = await Promise.race([
          admin.auth().verifyIdToken(token),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Token verification timeout")),
              10000
            )
          ),
        ]);
      } catch (tokenErr) {
        await logSecurityEvent("token_verification_failed", {
          email: sanitizedEmail,
          error: tokenErr.message,
          ipAddress: req.ip,
        });
        await recordFailedLogin(sanitizedEmail);
        return res.status(401).json({ msg: "Authentication failed" });
      }

      const uid = decodedToken.uid;

      // Verify email matches
      if (decodedToken.email.toLowerCase() !== sanitizedEmail) {
        await logSecurityEvent("email_mismatch", {
          uid,
          providedEmail: sanitizedEmail,
          tokenEmail: decodedToken.email,
          ipAddress: req.ip,
        });
        await recordFailedLogin(sanitizedEmail);
        return res.status(401).json({ msg: "Authentication failed" });
      }

      const usersRef = db.collection("users");
      const userDoc = await usersRef.doc(uid).get();

      if (!userDoc.exists) {
        await logSecurityEvent("user_not_found", {
          uid,
          email: sanitizedEmail,
          ipAddress: req.ip,
        });
        await recordFailedLogin(sanitizedEmail);
        return res.status(404).json({
          msg: "User profile not found. Please complete registration.",
        });
      }

      const user = userDoc.data();

      const payload = {
        user: {
          id: uid,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "7d" }, // Token expires in 7 days
        async (err, jwtToken) => {
          if (err) {
            await logSecurityEvent("jwt_generation_failed", {
              uid,
              error: err.message,
              ipAddress: req.ip,
            });
            return res.status(500).json({ msg: "Error generating token" });
          }

          // Clear failed login attempts on success
          await clearLoginAttempts(sanitizedEmail);

          // Log successful login
          await logSecurityEvent("login_success", {
            uid,
            email: sanitizedEmail,
            ipAddress: req.ip,
          });

          res.json({
            token: jwtToken,
            user: {
              id: uid,
              name: user.name,
              email: user.email,
              subscription: user.subscription,
              role: user.role,
            },
          });
        }
      );
    } catch (err) {
      console.error("Login error:", err);
      await logSecurityEvent("login_error", {
        email,
        error: err.message,
        ipAddress: req.ip,
      });

      // Record failed attempt for rate limiting
      await recordFailedLogin(email);

      res.status(500).json({
        msg: "Authentication failed",
      });
    }
  }
);

// Forgot Password - Generate reset token
router.post(
  "/forgot-password",
  [check("email", "Please include a valid email").isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    try {
      if (!db) return res.status(500).json({ msg: "Database not initialized" });

      const usersRef = db.collection("users");
      const snapshot = await usersRef.where("email", "==", email).get();

      if (snapshot.empty) {
        return res
          .status(404)
          .json({ msg: "No account with that email address exists." });
      }

      const userDoc = snapshot.docs[0];
      const userId = userDoc.id;

      // Generate reset token (simple approach without email)
      const resetToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // Store token and expiry in database
      await usersRef.doc(userId).update({
        resetPasswordToken: resetToken,
        resetPasswordExpires: Date.now() + 3600000, // 1 hour
      });

      res.json({
        msg: "Password reset token generated successfully",
        resetToken,
        email: email,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// Reset Password - Validate token and update password
router.post(
  "/reset-password",
  [
    check(
      "newPassword",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resetToken, newPassword } = req.body;
    try {
      if (!db) return res.status(500).json({ msg: "Database not initialized" });

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(400).json({ msg: "Invalid or expired reset token" });
      }

      // Find user with valid token
      const usersRef = db.collection("users");
      const userDoc = await usersRef.doc(decoded.userId).get();

      if (!userDoc.exists) {
        return res.status(400).json({ msg: "User not found" });
      }

      const user = userDoc.data();

      if (
        user.resetPasswordToken !== resetToken ||
        user.resetPasswordExpires < Date.now()
      ) {
        return res
          .status(400)
          .json({ msg: "Password reset token is invalid or has expired" });
      }

      // Update password in Firebase Auth
      await admin.auth().updateUser(decoded.userId, {
        password: newPassword,
      });

      // Clear reset token fields in Firestore
      await usersRef.doc(decoded.userId).update({
        resetPasswordToken: admin.firestore.FieldValue.delete(),
        resetPasswordExpires: admin.firestore.FieldValue.delete(),
      });

      res.json({ msg: "Password has been reset successfully" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

export default router;
