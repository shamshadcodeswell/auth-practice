import mongoose from "mongoose";

const sessionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user is required"],
    },
    refreshTokenHash: {
      type: String,
    },
    ip: {
      type: String,
      req: [true, "ip is required"],
    },
    userAgent: {
      type: String,
      req: [true, "user agent is required"],
    },
    revoke: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const sessionModel = mongoose.model("Session", sessionSchema);

export default sessionModel;
