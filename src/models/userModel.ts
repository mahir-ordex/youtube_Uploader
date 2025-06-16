import mongoose, { Types } from "mongoose";

interface UserDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  googleId?: string;
  username: string;
  email: string;
  password: string;
  role: "creator" | "user";
  access?: string[];
  createdAt: Date;
  updatedAt: Date;
  youtubeAccessToken?: string;
  youtubeRefreshToken?: string;

}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    googleId: {
      type: String,
      unique: true,
    },
    username: {
      type: String,
      // unique: true,
      required: false
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,

    },
     role: {
    type: String,
    enum: ['user', 'creator'],
    default: 'user',
    },
    access: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    youtubeAccessToken: {
      type: String,
    },
    youtubeRefreshToken: {
      type: String,
    }
  },
  { timestamps: true }
);


userSchema.pre("save", function (next) {
  if (this.role === "creator" && !this.access) {
    this.access = [];
  } else if (this.role !== "creator") {
    this.access = undefined;
  }
  next();
});

const User = mongoose.model<UserDocument>("User", userSchema);
export default User;
export { UserDocument };
