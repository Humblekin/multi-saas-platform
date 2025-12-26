import { db } from "../firebaseAdmin.js";

export const requireSubscription = (requiredSystem = null) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      if (!userId) {
        return res.status(401).json({ msg: "User not authenticated" });
      }

      // Get user from database
      const userDoc = await db.collection("users").doc(userId).get();

      if (!userDoc.exists) {
        return res.status(404).json({ msg: "User not found" });
      }

      const user = userDoc.data();

      // Admin bypass - admins can access everything
      if (user.role === "admin") {
        return next();
      }

      // Check if user has active subscription
      if (!user.subscription || !user.subscription.isActive) {
        return res.status(403).json({
          msg: "Active subscription required",
          requiresPayment: true,
        });
      }

      // Check subscription expiry
      if (user.subscription.endDate) {
        const endDate = new Date(user.subscription.endDate);
        if (endDate < new Date()) {
          return res.status(403).json({
            msg: "Subscription has expired",
            requiresPayment: true,
          });
        }
      }

      // If a specific system is required, verify user has access to it
      if (requiredSystem) {
        const userSystem = user.subscription.planType;
        // Allow access if user has 'All' plan or specific plan matches
        if (userSystem !== "All" && userSystem !== requiredSystem) {
          return res.status(403).json({
            msg: `Access denied. This feature requires ${requiredSystem} subscription. You have ${userSystem}.`,
            wrongSystem: true,
          });
        }
      }

      // Attach user data to request for use in routes
      req.userData = user;
      next();
    } catch (err) {
      console.error("Subscription check error:", err);
      res
        .status(500)
        .json({ msg: "Server error during subscription verification" });
    }
  };
};
