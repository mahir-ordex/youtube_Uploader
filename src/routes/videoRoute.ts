import {youTubeUploadAfterApprovel} from '../controllers/commanController/authController'
import { fetchVideos, uploadVideo } from '../controllers/user/dashBoardController';
import e, { Router } from "express";
import upload from '../utils/multer'; // Assuming you have a multer setup for file uploads
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

router.post(
    "/upload",authMiddleware,
    upload.fields([
      { name: "url", maxCount: 1 },
      { name: "thumbnailUrl", maxCount: 1 },
    ]),
    uploadVideo
  );
  
router.get("/videos",authMiddleware, fetchVideos);
router.get("/upload/after/approvel/:id",authMiddleware, youTubeUploadAfterApprovel)
router.get("/videos/approve/:id", (req, res) => {
    const videoId = req.params.id;
    res.redirect("/api/video/upload/after/approvel/" + videoId);
  res.send("Video approved successfully." + videoId);
})
router.get("/videos/reject/:id", (req, res) => {
  res.send("Video rejected successfully."+ req.params.id);
})

export default router;