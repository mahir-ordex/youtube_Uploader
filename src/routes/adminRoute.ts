import { getUsers, getVideos, handleAddUserForAccess, handleRemoveUserForAccess } from "../controllers/admin/dashBoardController";
import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

// Dashboard routes
router.get("/users", getUsers);
router.get("/videos", getVideos);
router.post("/addUserForAccess", handleAddUserForAccess);
router.post("/removeUserForAccess", handleRemoveUserForAccess);

export default router;

