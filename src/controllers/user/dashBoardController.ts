import { Request, Response } from "express";
import Video from "../../models/videoModel";
import nodemailer from "nodemailer";
import cloudinary from "../../utils/cloudinary";
import User from "../../models/userModel";
import { APIS } from "googleapis/build/src/apis";
import { c } from "vite/dist/node/moduleRunnerTransport.d-CXw_Ws6P";

const fetchVideos = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.cookies._id;
    const videos = await Video.find({ uploaderId: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    if (!videos || videos.length === 0) {
      return res.status(404).json({ message: "No videos found" });
    }

    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: "Error fetching videos", error });
  }
};

const uploadVideo = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?._id;
    const { title, description, creatorId } = req.body;

    // console.log("Request body:", req.body);

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    // console.log("Files:", files);
    const videoFile = files?.url?.[0];
    const thumbnailFile = files?.thumbnailUrl?.[0];

    if (!videoFile) {
      return res.status(400).json({ message: "Video file is required" });
    }

    const videoUrl = videoFile.path;
    const uploadedThumbnailUrl = thumbnailFile
      ? await uploadCloudinary(thumbnailFile.path)
      : undefined;

    if (!uploadedThumbnailUrl) {
      return res.status(500).json({ message: "Error uploading thumbnail" });
    }

    const newVideo = new Video({
      creatorId,
      uploaderId: userId,
      title,
      description,
      videourl: videoUrl,
      thumbnailUrl: uploadedThumbnailUrl,
    });
    // console.log("New video object:", newVideo);

    await newVideo.save();

    const email = "mahirmankad69@gmail.com"
    // console.log("Creator email:", email);
    // if (creatorEmail?.email) {
      // console.log("Sending approval email to:", email);
      await sendApprovalEmail(email, (newVideo._id as string).toString(),newVideo.thumbnailUrl as string);
    // }

    res.status(201).json({ message: "Video uploaded successfully", video: newVideo });
  } catch (error) {
    res.status(500).json({ message: "Error uploading video", error });
    console.error("Error uploading video:", error);
  }
}; 

const uploadCloudinary = async (filePath: string) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      folder: "thumbnails",
    });
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Cloudinary upload failed");
  }
};

const sendApprovalEmail = async (to: string ="mahirmankad69@gmail.com", videoId: string,thumbnail:string) => {
  // console.log("Creating transporter for email");  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_HOST,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // console.log("Sending email to:", to);
  // console.log("Video ID for approval:", videoId);

  if (!to || !videoId) {
    console.error("Invalid email or video ID for approval email");
    return;
  }
  // console.log("Creating email content for approval");

  const htmlContent = getApprovalEmailHTML(videoId,thumbnail);

  const mailOptions = {
    from: `"Video Review System" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Video Approval Needed",
    html: htmlContent,
  };
  // console.log("Mail options:", mailOptions);
  // console.log("Sending email...");
  // console.log("Transporter:", transporter);
  // console.log("Sending email to:", to);
  // console.log("HTML content:", htmlContent);

  await transporter.sendMail(mailOptions);
};

const getApprovalEmailHTML = (videoId: string,thumbnail: string) => {
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";
  const approveUrl = `${baseUrl}/api/video/videos/approve/${videoId}`;
  const rejectUrl = `${baseUrl}/api/video/videos/reject/${videoId}`;

  // console.log("get APIScsdcsdcsdcsdcsdcd URL:");

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>New Video Uploaded for Review</h2>
      <p>A new video has been uploaded and is awaiting your approval.</p>
      <p><strong>Video ID:</strong> ${videoId}</p>
      <div style="margin-top: 20px;">
      <img src="${thumbnail}" alt="Video Thumbnail" style="width: 100%; max-width: 300px; border-radius: 5px;" />
        <a href="${approveUrl}" style="padding: 10px 20px; background-color: green; color: white; text-decoration: none; border-radius: 5px;">Approve</a>
        <a href="${rejectUrl}" style="padding: 10px 20px; background-color: red; color: white; text-decoration: none; border-radius: 5px; margin-left: 10px;">Reject</a>
      </div>
    </div>
  `;
};

export { fetchVideos, uploadVideo };
