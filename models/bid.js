import mongoose  from "mongoose";

const bidSchema = new mongoose.Schema({
    price: {
      type: Number,
      required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // reference to User model
        required: true
    },
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing', // reference to Listing model
        required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
},{timestamps:true});

const Bid=mongoose.model('bid',bidSchema); // bid model

export default Bid
