import mongoose, { Types } from "mongoose";

interface UserDocument extends mongoose.Document {
  googleId?: string;
  username?: string;
  email: string;
  password?: string;
  role: 'user' | 'creator';
  access?: Types.ObjectId[];
  youtubeAccessToken?: string;
  youtubeRefreshToken?: string;
  // Friend request system
  sentRequests: Types.ObjectId[]; // Requests sent by this user
  receivedRequests: Types.ObjectId[]; // Requests received by this user
  friends: Types.ObjectId[]; // Accepted connections
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    googleId: {
      type: String,
      unique: true,
    },
    username: {
      type: String,
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
    access:[ {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    youtubeAccessToken: {
      type: String,
    },
    youtubeRefreshToken: {
      type: String,
    },
    // Friend request system
    sentRequests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: []
    }],
    receivedRequests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      default: []
    }],
    friends: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: []
    }]
  },
  { timestamps: true }
);

// Update the pre-save hook
userSchema.pre("save", function (next) {
  if (this.role === "creator" && !this.access) {
    this.access = [];
  } else if (this.role !== "creator") {
    this.access = undefined;
  }
  
  // Initialize friend request arrays if they don't exist
  if (!this.sentRequests) this.sentRequests = [];
  if (!this.receivedRequests) this.receivedRequests = [];
  if (!this.friends) this.friends = [];
  
  next();
});

let User = mongoose.model<UserDocument>("User", userSchema);

export { UserDocument };
export default User;
