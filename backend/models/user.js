import mongoose  from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  listings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing"
    }
  ],
  isDeleted:{
    type:Boolean,
    default:false
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
    required: true
  }
});

const User=mongoose.model('User',userSchema); // user model

export default User
