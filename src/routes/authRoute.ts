import { CancelToken } from './../../Client/node_modules/axios/index.d';
import { Router, Request, Response, NextFunction } from "express";
import {
  signin,
  signup,
} from "../controllers/commanController/authController.js";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { OAuth2Client } from "google-auth-library";
import User from "../models/userModel.js";

// Extend the User type to include _id
declare global {
  namespace Express {
    interface User {
      _id: string;
      token?: string; // Add the token property
    }
  }
}

const router = Router();

router.post("/signin", signin);
router.post("/signup", signup);


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
router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/youtube.upload",
    ],
    accessType: "offline",
    prompt: "consent",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = req?.user?.token;
    const userId = req?.user?._id;

    res.cookie("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // No need to set cookie
    return res.redirect(`http://localhost:5173/auth/success?token=${token}&id=${userId}`);
  }
);

export default router;
