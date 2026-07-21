import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: [true, "username must be unique"],
    required: [true, "username is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: [true, "email must be unique"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
});

export default mongoose.model("User", userSchema);
