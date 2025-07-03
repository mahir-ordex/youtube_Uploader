import { youTubeUploadAfterApprovel } from '../controllers/commanController/authController';
import { fetchVideos, uploadVideo } from '../controllers/user/dashBoardController';
import { Router } from "express";
import upload from '../utils/multer';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post(
  "/upload",
  authMiddleware,
  roleMiddleware(["user","creator"]),
  upload.fields([
    { name: "url", maxCount: 1 },
    { name: "thumbnailUrl", maxCount: 1 },
  ]),
  uploadVideo
);

router.get("/videos", authMiddleware, roleMiddleware(["user", "creator"]), fetchVideos);

router.get("/upload/after/approvel/:id", authMiddleware, roleMiddleware(["creator"]), youTubeUploadAfterApprovel);

router.get("/videos/approve/:id", authMiddleware, roleMiddleware(["creator"]), (req, res) => {
  const videoId = req.params.id;
  res.redirect("/api/video/upload/after/approvel/" + videoId);
});

router.get("/videos/reject/:id", authMiddleware, roleMiddleware(["creator"]), (req, res) => {
  res.send("Video rejected successfully." + req.params.id);
});

export default router;