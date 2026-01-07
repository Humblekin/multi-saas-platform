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
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/emailService.js";
import crypto from "crypto";
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

      const verificationToken = crypto.randomBytes(32).toString("hex");

      const newUser = {
        name: sanitizedName,
        email: sanitizedEmail,
        role: "user",
        isVerified: true,
        verificationToken,
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

      // Verification email disabled as per user request
      // await sendVerificationEmail(sanitizedEmail, verificationToken, sanitizedName);

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

      /* 
      // Check if email is verified - Disabled as per user request
      if (!user.isVerified) {
        await logSecurityEvent("login_unverified_email", {
          uid,
          email: sanitizedEmail,
          ipAddress: req.ip,
        });
        return res.status(403).json({
          msg: "Please verify your email before logging in. Check your inbox for the verification link.",
          isUnverified: true
        });
      }
      */

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

// Forgot Password - Generate reset token and send email
router.post(
  "/forgot-password",
  [check("email", "Please include a valid email").isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const sanitizedEmail = email.toLowerCase().trim();
    try {
      if (!db) return res.status(500).json({ msg: "Database not initialized" });

      const usersRef = db.collection("users");
      const snapshot = await usersRef.where("email", "==", sanitizedEmail).get();

      if (snapshot.empty) {
        console.log(`Password reset requested for non-existent email: ${sanitizedEmail}`);
        // For security, don't reveal if user doesn't exist
        return res.json({
          msg: "If an account with that email exists, a password reset link has been sent.",
        });
      }

      const userDoc = snapshot.docs[0];
      const userId = userDoc.id;
      const userData = userDoc.data();

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Store token and expiry in database
      await usersRef.doc(userId).update({
        resetPasswordToken: resetToken,
        resetPasswordExpires: Date.now() + 3600000, // 1 hour
      });

      // Send email
      const emailSent = await sendPasswordResetEmail(email, resetToken, userData.name);

      if (!emailSent) {
        return res.status(500).json({ msg: "Failed to send reset email. Please try again later." });
      }

      res.json({
        msg: "If an account with that email exists, a password reset link has been sent.",
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// Resend Verification Email
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: "Email is required" });
  }

  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email.toLowerCase()).get();

    if (snapshot.empty) {
      console.log(`Verification resend failed: User with email ${email.toLowerCase()} not found in database.`);
      // Don't reveal if user doesn't exist for security
      return res.json({ msg: "If an account exists, a new verification link has been sent." });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    if (userData.isVerified) {
      return res.status(400).json({ msg: "Email already verified" });
    }

    // Generate new token
    const newVerificationToken = crypto.randomBytes(32).toString("hex");

    await usersRef.doc(userDoc.id).update({
      verificationToken: newVerificationToken,
    });

    // Send email
    const emailSent = await sendVerificationEmail(email, newVerificationToken, userData.name);

    if (!emailSent) {
      return res.status(500).json({ msg: "Failed to send verification email. Please try again later." });
    }

    res.json({ msg: "Verification email resent successfully." });
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ msg: "Server error during resend" });
  }
});

// Email Verification Route
router.get("/verify-email", async (req, res) => {
  const { email, token } = req.query;

  if (!email || !token) {
    return res.status(400).json({ msg: "Missing email or token" });
  }

  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email.toLowerCase()).get();

    if (snapshot.empty) {
      console.log(`Email verification failed: Email ${email.toLowerCase()} not found.`);
      return res.status(400).json({ msg: "Invalid verification link" });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    if (userData.isVerified) {
      return res.status(200).json({ msg: "Email already verified" });
    }

    if (userData.verificationToken !== token) {
      return res.status(400).json({ msg: "Invalid verification token" });
    }

    await usersRef.doc(userDoc.id).update({
      isVerified: true,
      verificationToken: admin.firestore.FieldValue.delete(),
    });

    res.json({ msg: "Email verified successfully. You can now log in." });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ msg: "Server error during verification" });
  }
});

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

      // Find user with valid token
      const usersRef = db.collection("users");
      const snapshot = await usersRef
        .where("resetPasswordToken", "==", resetToken)
        .where("resetPasswordExpires", ">", Date.now())
        .get();

      if (snapshot.empty) {
        return res.status(400).json({ msg: "Invalid or expired reset token" });
      }

      const userDoc = snapshot.docs[0];
      const userId = userDoc.id;

      // Update password in Firebase Auth
      await admin.auth().updateUser(userId, {
        password: newPassword,
      });

      // Clear reset token fields in Firestore
      await usersRef.doc(userId).update({
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
