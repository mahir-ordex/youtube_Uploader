import { Router } from "express";
// import {
//   signin,
//   signup,
// } from "../controllers/commanController/authController.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { OAuth2Client } from "google-auth-library";

// Extend the User type to include _id
declare global {
  namespace Express {
    interface User {
      _id: string;
      token?: string; // Add the token property
      role?: string; // Add the role property
    }
  }
}

const router = Router();

// router.post("/signin", signin);
// router.post("/signup", signup);

// Initiate auth
// router.get(
//   "/auth/facebook",
//   passport.authenticate("facebook", { scope: ["email"] })
// );

// // Facebook callback route
// router.get(
//   "/auth/facebook/callback",
//   passport.authenticate("facebook", {
//     failureRedirect: "/login", // You can customize this
//     session: false, // Set to true if you're using sessions
//   }),
//   (req, res) => {
//     // Successful login
//     res.send("Facebook Login Successful!");
//     // You can also redirect or issue JWT here
//   }
// );

// Google OAuth routes
// router.get("/google")
router.get("/google", (req, res, next) => {
  const { state } = req.query;

  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/youtube.upload",
    ],
    accessType: "offline",
    prompt: "consent",
    state: state as string,
  })(req, res, next);
});

import type { Request, Response } from "express";

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/signin?error=user_not_found",
  }),
  (req, res) => {
    // Use req.user instead of profile
    if (!req.user) {
      // This will trigger if authentication fails
      return res.redirect(
        "http://localhost:5173/signin?error=authentication_failed"
      );
    }

    const user = req.user as Express.User;
    const token = user.token || "";
    const userId = user._id || "";
    const role = user.role || "user";

    console.log("User authenticated:", user);

    // Parse state from query parameter if needed
    const state = req.query.state
      ? JSON.parse(decodeURIComponent(req.query.state as string))
      : {};

    // Redirect to frontend with token
    const redirectUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/auth/success?token=${token}&id=${userId}&role=${role}`;

    console.log("Redirecting to:", redirectUrl);

    res.cookie("auth_token", token).redirect(redirectUrl);
  }
);

export default router;
function failiareRedirect(...args: any[]) {
  throw new Error("Function not implemented.");
}

