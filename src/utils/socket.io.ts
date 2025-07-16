import { Server, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import User from "../models/userModel"
import video from '../models/videoModel';

interface AuthenticatedSocket extends Socket {
    userId?: string;
    userRole?: string;
}
const initializeSocket = (server: HTTPServer) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true

        }
    })

    io.use(async (socket: AuthenticatedSocket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers?.authorization?.split(" ")[1]
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

            const user = await User.findById(decoded.id);

            if (!user) {
                return next(new Error('User not found'));
            }

            if (user && typeof user._id === 'object' && user._id !== null && 'toString' in user._id) {
                socket.userId = user._id.toString();
            }
            socket.userRole = user?.role;
            next()
        } catch (error) {
            next(new Error('Authentication error'));
        }
    })
    io.on("connection", (socket: AuthenticatedSocket) => {
        console.log(`User ${socket.userId} connected`);

        socket.join(`user_${socket.userId}`)
        if (socket.userRole === 'creator') {
            socket.join(`creators_${socket.userId}`);
        }
        socket.on('disconnect', () => {
            console.log(`User ${socket.userId} disconnected`);
        });

        socket.on("send_friend_request", async (data) => {
            const { receiverId } = data;
            io.to(`user_${receiverId}`).emit("friend_request_received", {
                senderId: socket.userId,
                senderName: await getUserName(socket.userId!),
                message: 'You have a new friend request'
            });
        });
        socket.on("accept_friend_request", async (data) => {
            const { senderId } = data;
            io.to(`user_${senderId}`).emit("friend_request_accepted", {
                accepterId: socket.userId,
                accepterName: await getUserName(socket.userId!),
                message: 'Your friend request was accepted'
            })
        })
        socket.on("get_friend_request", async (data) => {
            const { userId, receivedRequests, sentRequests, friends } = data;
            io.to(`user_${userId}`).emit("get_friend_request", {
                receivedRequests,
                sentRequests,
                friends
            })
        })
        socket.on('reject_friend_request', async (data) => {
            const { senderId } = data;
            // Notify the original sender
            io.to(`user_${senderId}`).emit('friend_request_rejected', {
                rejecterId: socket.userId,
                message: 'Your friend request was rejected'
            });
        });
        socket.on("video_upload", async (data) => {
            const { videoId, title, uploaderId } = data;
            try {
                const videoData = await video.findById(videoId).populate("creatorId")
                if (videoData && videoData.creatorId) {
                    const creatorId = videoData.creatorId._id;
                    // Notify the specific creator
                    io.to(`user_${creatorId}`).emit('new_video_upload', {
                        videoId,
                        title,
                        uploaderId,
                        uploaderName: await getUserName(uploaderId),
                        creatorId: creatorId,
                        message: `New video "${title}" uploaded for approval`
                    });
                    const creator = await User.findById(creatorId);
                    if (creator && creator.access && creator.access.length > 0) {

                        for (let accessUserId of creator.access) {
                            if (accessUserId.toString() !== uploaderId) {
                                io.to(`user_${accessUserId}`).emit("video_notification_new_video_uploaded", {
                                    ...videoData
                                })
                            }
                        }
                    }
                }
            }
            catch (error) {
                console.error('Error in video_upload event:', error);
            }
        })
        socket.on('video_approved', (data) => {
            const { uploaderId, videoId, title } = data;
            // Notify the uploader
            io.to(`user_${uploaderId}`).emit('video_status_update', {
                videoId,
                status: 'approved',
                title,
                message: `Your video "${title}" has been approved!`
            });
        })
        socket.on("video_reject", (data) => {
            const { videoId, uploaderId, title } = data;
            io.to(`user_${uploaderId}`).emit("video_status_update", {
                videoId,
                status: "rejected",
                title,
                message: `Your video "${title}" has been rejected`
            })
        })
        // Chat/messaging between friends
        socket.on('send_message', async (data) => {
            const { receiverId, message } = data;
            const senderName = await getUserName(socket.userId!);

            // Send message to receiver
            io.to(`user_${receiverId}`).emit('message_received', {
                senderId: socket.userId,
                senderName,
                message,
                timestamp: new Date()
            });
        });

        // Online status
        socket.on('user_online', () => {
            socket.broadcast.emit('user_status_update', {
                userId: socket.userId,
                status: 'online'
            });
        });
    });

    return io;
};

// Helper function to get user name
const getUserName = async (userId: string): Promise<string> => {
    try {
        const user = await User.findById(userId);
        return user?.username || user?.email || 'Unknown User';
    } catch (error) {
        return 'Unknown User';
    }
};

export default initializeSocket;