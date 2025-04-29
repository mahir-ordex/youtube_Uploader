import mongoose, { Mongoose } from "mongoose";


interface VideoDocument extends mongoose.Document {
    creatorId: mongoose.Types.ObjectId;
    uploaderId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    videourl: string;
    thumbnailUrl: string;
    isAproved: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const videoSchema = new mongoose.Schema<VideoDocument>({
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    uploaderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    videourl: {
        type: String,
        required: true,
    },
    thumbnailUrl: {
        type: String,
        required: true,
    },
    isAproved: {
        type: Boolean,
        default: false,  
    }
}, { timestamps: true });

const video = mongoose.model<VideoDocument>("Video",videoSchema);

export default video;
export { VideoDocument };