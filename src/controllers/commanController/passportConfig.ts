import JWT from 'jsonwebtoken';
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User, { UserDocument } from "../../models/userModel";
import dotenv from "dotenv";
import { response } from 'express';

dotenv.config();

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://localhost:5000/api/auth/google/callback",
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne<UserDocument>({ googleId: profile.id });

        if (!user) {
          user = new User<any>({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0].value || "no-email@example.com",
            avatar: profile.photos?.[0].value,
            youtubeAccessToken: accessToken,
            youtubeRefreshToken: refreshToken,
          });
        } else {
          user.youtubeAccessToken = accessToken;
          if (refreshToken) user.youtubeRefreshToken = refreshToken;
        }

        await user.save();

        const token = JWT.sign(
          { id: user._id, role: user.role, access: user.access },
          process.env.JWT_SECRET!,
          { expiresIn: '7d' }
        );

        const userWithToken = user.toObject();
        userWithToken.token = token;

        return done(null, userWithToken);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);
