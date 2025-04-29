import User,{UserDocument} from "../../models/userModel";
import e, { Request, Response } from "express";
import video, {VideoDocument} from "../../models/videoModel";

const getUsers = async (req: Request, res: Response):Promise<UserDocument | any > => {
    try {
        const users = await User.find({role: "user"})
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const getVideos = async(req: Request, res: Response):Promise<VideoDocument | any > => {
    try {
        const id = req.cookies._id;
        const videos = await video.find({creatorId : id});
        if (!videos) {
            return res.status(404).json({ message: "Videos not found" });
        }

        res.status(200).json(videos);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const handleAddUserForAccess = async (req : Request,res : Response):Promise<any> =>{
    try {
        const { userId} = req.body;
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

const handleRemoveUserForAccess = async (req : Request,res : Response):Promise<any> =>{
    try{
       const creatorId = req.cookies._id;
       const {userId} = req.body;

       await User.findByIdAndUpdate(creatorId,
        {
            $pull: { access: userId }
        });
         res.status(200).json({ message: "Access removed successfully" });     
    }catch(error){
        res.status(500).json({ message: "Internal server error" });
        // console.log(error);
    }
}

export { getUsers, getVideos, handleAddUserForAccess, handleRemoveUserForAccess };