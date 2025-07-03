import { getUsers, getVideos, handleAddUserForAccess, handleRemoveUserForAccess } from "../controllers/admin/dashBoardController";
import { Router } from "express";
import {authMiddleware,roleMiddleware} from "../middleware/authMiddleware";

const router = Router();

// Dashboard routes
router.get("/users",authMiddleware,roleMiddleware(["creator"]), getUsers);
router.get("/videos",roleMiddleware(["user","creator"]), getVideos);
router.post("/addUserForAccess",roleMiddleware(["creator"]), handleAddUserForAccess);
router.post("/removeUserForAccess",roleMiddleware(["creator"]), handleRemoveUserForAccess);

export default router;

