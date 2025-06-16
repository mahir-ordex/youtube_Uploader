import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../../models/userModel";
import jwt from "jsonwebtoken";

// Make sure these env variables are set
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL || !JWT_SECRET) {
  console.error("Missing required environment variables for Google OAuth");
  process.exit(1);
}

// Serialize/deserialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj: any, done) => {
  done(null, obj);
});

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Parse state parameter to get role information
        const state = req.query.state ? JSON.parse(decodeURIComponent(req.query.state as string)) : {};
        const role = state.role || "user";
        console.log("Google auth state:", state);
        console.log("Access token:", accessToken);
        console.log("Refresh token:", refreshToken);
        
        // Find or create user
        const existingUser = await User.findOne({ googleId: profile.id });
        
        if (existingUser) {
          // Update existing user with new tokens
          existingUser.youtubeAccessToken = accessToken;
          if (refreshToken) {
            existingUser.youtubeRefreshToken = refreshToken;
          }
          await existingUser.save();
          
          // Generate JWT token
          const token = jwt.sign(
            { id: existingUser._id },
            JWT_SECRET,
            { expiresIn: "7d" }
          );
          
          // Return user with token
          return done(null, { 
            ...existingUser.toObject(), 
            _id: existingUser._id.toString(),
            token 
          });
        } else {
          // Create new user
          const newUser = new User({
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            username: profile.displayName,
            youtubeAccessToken: accessToken,
            youtubeRefreshToken: refreshToken,
            role: role, // Use the role from state
          });
          
          await newUser.save();
          
          // Generate JWT token
          const token = jwt.sign(
            { id: newUser._id },
            JWT_SECRET,
            { expiresIn: "7d" }
          );
          
          // Return new user with token
          return done(null, { 
            ...newUser.toObject(), 
            _id: newUser._id.toString(),
            token 
          });
        }
      } catch (error) {
        console.error("Error in Google strategy:", error);
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;
