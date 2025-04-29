import JWT from 'jsonwebtoken';
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User, { UserDocument } from "../../models/userModel";
import dotenv from "dotenv";

dotenv.config();

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://localhost:5000/api/auth/google/callback",
      passReqToCallback: true // Add this to receive the req object
    },
    async (req, accessToken, refreshToken, profile, done) => {
      // console.log("Google Strategy triggered");
      try {
        let user = await User.findOne<UserDocument>({ googleId: profile.id });

        if (!user) {
          // console.log("Creating new user");
          user = new User<any>({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0].value || "no-email-provided@example.com",
            avatar: profile.photos?.[0].value,
            youtubeAccessToken: accessToken,
            youtubeRefreshToken: refreshToken,
          });
        } else {
          // console.log("Updating existing user tokens");
          user.youtubeAccessToken = accessToken;
          if (refreshToken) user.youtubeRefreshToken = refreshToken;
        }

        await user.save();

        // console.log("User saved:", profile.displayName);
        const token = JWT.sign(
          { id: user._id, role: user.role, access: user.access },
          process.env.JWT_SECRET!
        );

        // console.log("JWT Token:", token);
        
        // Store token in the user object so we can access it in the callback
        const userWithToken = user.toObject();
        userWithToken.token = token;
        
        return done(null, userWithToken);
      } catch (error) {
        console.error("Error in Google Strategy:", error);
        return done(error, undefined);
      }
    }
  )
);