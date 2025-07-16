import User, { UserDocument } from "../../models/userModel";
import e, { Request, Response } from "express";
import video, { VideoDocument } from "../../models/videoModel";
import mongoose from "mongoose";
import { useId } from "react";

// helper function
const getUserName = async (userId: string): Promise<string> => {
    try {
        const user = await User.findById(userId);
        return user?.username || user?.email || 'Unknown User';
    } catch (error) {
        return 'Unknown User';
    }
};

const getUsers = async (req: Request, res: Response): Promise<UserDocument | any> => {
    try {
        const users = await User.find({ role: "user" })
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const getVideos = async (req: Request, res: Response): Promise<VideoDocument | any> => {
    try {
        const id = req.cookies._id;
        const videos = await video.find({ creatorId: id });
        if (!videos) {
            return res.status(404).json({ message: "Videos not found" });
        }

        res.status(200).json(videos);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const handleAddUserForAccess = async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId } = req.body;
        const creatorId = req.cookies._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const creator = await User.findByIdAndUpdate(creatorId, {
            $set: { access: [userId] }
        }, { new: true });
        if (!creator) {
            return res.status(404).json({ message: "Creator not found" });
        }
        res.status(200).json({ message: "Access added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const handleRemoveUserForAccess = async (req: Request, res: Response): Promise<any> => {
    try {
        const creatorId = req.cookies._id;
        const { userId } = req.body;

        await User.findByIdAndUpdate(creatorId,
            {
                $pull: { access: userId }
            });
        res.status(200).json({ message: "Access removed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        // console.log(error);
    }
}

const sendFriendRequest = async (req: Request, res: Response): Promise<any> => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user?._id; // Get from authenticated user
        const io = req.app.get("io")

        if (!senderId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (senderId === receiverId) {
            return res.status(400).json({ message: "Cannot send request to yourself" });
        }
        const receiver = await User.findById(receiverId)

        if (!receiver) {
            return res.status(404).json({ success: false, message: "user not found" })
        }
        const sender = await User.findById(senderId);
        if (!sender) {
            return res.status(404).json({ message: "Sender not found" });
        }
        if (sender.friends.includes(new mongoose.Types.ObjectId(receiverId))) {
            return res.status(400).json({ message: "Already friends" });
        }

        // Check if request already sent
        if (sender.sentRequests.includes(new mongoose.Types.ObjectId(receiverId))) {
            return res.status(400).json({ message: "Request already sent" });
        }

        // Check if request already received (reverse case)
        if (receiver.sentRequests.includes(new mongoose.Types.ObjectId(senderId))) {
            return res.status(400).json({ message: "Request already received from this user" });
        }
        await User.findByIdAndUpdate(senderId, {
            $addToSet: { sentRequests: receiverId }
        })
        await User.findByIdAndUpdate(receiverId, {
            $addToSet: { sentRequests: senderId }
        })
        if (io) {
            const senderName = await getUserName(senderId);
            io.to(`user_${receiverId}`).emit('friend_request_received', {
                senderId,
                senderName,
                message: 'You have a new friend request'
            });
        }
        return res.status(200).json({ message: "friend request sended successfully" })
    } catch (error: unknown) {
        console.log("Faild to Send Friend Request", error);
        res.status(500).json({ success: "false", message: "Failed To Send Requenst", error: error })
    }
}
const acceptFriendRequest = async (req: Request, res: Response):Promise<any> => {
    try {
        const { id } = req.body;
        const userId = req.user?._id;
        const io = req.app.get("io")

        if (!id) {
            return res.status(400).json({ message: "Error" })
        }
        if (!userId) {
            return res.status(400).json({ message: "userId not found in req.user" })
        }
        await User.findByIdAndUpdate(id, {
            $addToSet: { friends: userId },
            $pull: { friends: userId }
        })
        await User.findByIdAndUpdate(userId, {
            $addToSet: { friends: id },
            $pull: { friends: userId }
        })
        if(io){
            const accepterName = await getUserName(userId);
            io.to(`user_${userId}`).emit("friend_request_accepted",{
                accepterId:userId,
                accepterName,
                message: 'Your friend request was accepted'
            })

        }
        // Optionally emit a socket event here if using socket.io
        res.status(200).json({ message: "Friend request accepted successfully" });

    } catch (error) {
        console.error("Error accepting friend request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
const rejectFriendRequest = async (req: Request, res: Response):Promise<any> => {
    try {
        const { senderId } = req.body;
        const receiverId = req.user?._id;
        const io = req.app.get("io")

        if (!receiverId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const receiver = await User.findById(receiverId);
        const sender = await User.findById(senderId);

        if (!receiver || !sender) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if request exists
        if (!receiver.receivedRequests.includes(senderId)) {
            return res.status(400).json({ message: "No friend request found" });
        }

        await User.findByIdAndUpdate(receiverId, {
            $pull: { friends: senderId }
        })
        await User.findByIdAndUpdate(senderId, {
            $pull: { friends: receiverId }
        })
        if(io){
            io.to(`user_${senderId}`).emit("friend_request_rejected",{
                rejecterId:receiverId,
                message: 'Your friend request was rejected'
            })
        }
        res.status(200).json({ message: "Friend request rejected successfully" });
    } catch (error) {
        console.error("Error rejecting friend request:", error);
        res.status(500).json({ message: "Internal server error" });

    }
}
const getFriendRequests = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?._id;
    const io = req.app.get("io")

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId)
      .populate('receivedRequests', 'username email')
      .populate('sentRequests', 'username email')
      .populate('friends', 'username email');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if(io){
        io.to(`user_${userId}`).emit("get_friend_request",{
            userId,
            receivedRequests: user.receivedRequests,
            sentRequests: user.sentRequests,
            friends: user.friends
        })
    }

    res.status(200).json({
      receivedRequests: user.receivedRequests,
      sentRequests: user.sentRequests,
      friends: user.friends
    });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove Friend
const removeFriend = async (req: Request, res: Response): Promise<any> => {
  try {
    const { friendId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Remove from both users' friends list
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId }
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId }
    });

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// export { getUsers, getVideos, handleAddUserForAccess, handleRemoveUserForAccess };
export { 
  getUsers, 
  getVideos, 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  getFriendRequests,
  removeFriend
};