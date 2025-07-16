import { getUsers, getVideos,acceptFriendRequest,getFriendRequests,rejectFriendRequest,removeFriend,sendFriendRequest } from "../controllers/admin/dashBoardController";
import { Router } from "express";
import {authMiddleware,roleMiddleware} from "../middleware/authMiddleware";

const router = Router();

// Dashboard routes
router.get("/users",authMiddleware,roleMiddleware(["creator"]), getUsers);
router.get("/videos",roleMiddleware(["user","creator"]), getVideos);
// router.post("/addUserForAccess",roleMiddleware(["creator"]), handleAddUserForAccess);
// router.post("/removeUserForAccess",roleMiddleware(["creator"]), handleRemoveUserForAccess);
router.post("/accept",roleMiddleware(["user","creator"]), acceptFriendRequest);
router.get("/all-requests",roleMiddleware(["user","creator"]), getFriendRequests);
router.post("/reject",roleMiddleware(["user","creator"]), rejectFriendRequest);
router.post("/remove-frind",roleMiddleware(["user","creator"]), removeFriend);
router.post("/send-request",roleMiddleware(["user","creator"]), sendFriendRequest);


export default router;

