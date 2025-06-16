import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/userModel.js";
import Video from "../../models/videoModel.js";
import fs from "fs";
// Removed duplicate import
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import passport from "passport";
import { google } from "googleapis";

// export const signin = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { email, password } = req.body;
//     // Check if user exists in the database
//     const user = await User.findOne({ email });
//     if (!user) {
//       res.status(404).json({ message: "User not found" });
//       return;
//     }
//     // Compare the password with the hashed password in the database
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       res.status(400).json({ message: "Invalid credentials" });
//       return;
//     }
//     // Generate a JWT token and send it back to the client
//     if (!process.env.JWT_SECRET) {
//       throw new Error("JWT_SECRET is not defined in the environment variables");
//     }
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });
//     res.status(200).json({ token, user });
//   } catch (error) {
//     next(error); // Pass errors to the error-handling middleware
//   }
// };

// export const signup = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { username, email, password } = req.body;
//     // Check if user already exists in the database
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       res.status(400).json({ message: "User already exists" });
//       return;
//     }
//     // Hash the password before saving it to the database
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({
//       username,
//       email,
//       password: hashedPassword,
//     });
//     await newUser.save();
//     // Generate a JWT token and send it back to the client
//     if (!process.env.JWT_SECRET) {
//       const creatorId = (req.user as any)?._id ?? null;
//     }
//     if (!process.env.JWT_SECRET) {
//       throw new Error("JWT_SECRET is not defined in the environment variables");
//     }
//     const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });
//     res.status(201).json({ token, user: newUser });
//   } catch (error) {
//     next(error); // Pass errors to the error-handling middleware
//   }
// };

export const youTubeUploadAfterApprovel = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const videoId = req.params.id;

    if (!videoId) {
      return res.status(400).json({ message: "Video ID is required" });
    }

    const creatorId = (req.user as any)?._id ?? null;
    console.log("Creator ID from request:", creatorId);
    if (!creatorId) {
      return res.status(400).json({ message: "Creator ID is required" });
    }

    const user = await User.findById(creatorId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const video = await Video.findByIdAndUpdate(videoId, {
      $set: {
        status: "approved",
      },
    });
    console.log("Video after update:", video);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (!user.youtubeAccessToken || !user.youtubeRefreshToken) {
      return res
        .status(400)
        .json({ message: "YouTube access token or refresh token is missing" });
    }
    // Initialize Google OAuth2 client
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({
        message: "Google client ID or secret is not defined in the environment variables",
      });
    }
    if (!process.env.GOOGLE_REDIRECT_URI) {
      return res.status(500).json({
        message: "Google redirect URI is not defined in the environment variables",
      });
    }
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI // Must match Google Cloud setup
    );

    oAuth2Client.setCredentials({
      access_token: user.youtubeAccessToken,
      refresh_token: user.youtubeRefreshToken,
      scope: "https://www.googleapis.com/auth/youtube.upload",
    });
    const videoPath = path.join(__dirname, `../../../${video.videourl}`);

    try {
      // Automatically refresh the access token if needed
      await oAuth2Client.getAccessToken();

      const youtube = google.youtube({
        version: "v3",
        auth: oAuth2Client,
      });

      const response = await youtube.videos.insert({
        part: ["snippet", "status"],
        requestBody: {
          snippet: {
            title: video.title,
            description: video.description,
          },
          status: {
            privacyStatus: "private",
          },
        },
        media: {
          body: fs.createReadStream(videoPath),
        },
      });
      await fs.promises.unlink(videoPath);
console.log("Local video file deleted:", videoPath);

return res.status(200).json({
  message: "Video uploaded to YouTube and deleted locally",
  data: response.data,
});

    } catch (error: any) {
      if (error.code === 401 && error.errors?.[0]?.reason === "authError") {
        console.log("Access token expired. Refreshing...");
        const tokens = await oAuth2Client.refreshAccessToken();
        const newAccessToken = tokens.credentials.access_token;

        // Update the user's access token in the database
        if (newAccessToken) {
          user.youtubeAccessToken = newAccessToken;
        } else {
          throw new Error("Failed to refresh access token");
        }
        await user.save();

        // Retry the request with the new access token
        oAuth2Client.setCredentials({
          access_token: newAccessToken,
          refresh_token: user.youtubeRefreshToken,
        });

        const retryResponse = await google.youtube("v3").videos.insert({
          part: ["snippet", "status"],
          requestBody: {
            snippet: {
              title: video.title,
              description: video.description,
            },
            status: {
              privacyStatus: "private",
            },
          },
          media: {
            body: fs.createReadStream(videoPath),
          },
        });

        return res.status(200).json({
          message: "Video uploaded to YouTube after refreshing token",
          data: retryResponse.data,
        });
      } else {
        console.log("Youtube upload Error! :", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
      }
    }
  } catch (error: any) {
    console.log("Youtube upload Error! :", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
