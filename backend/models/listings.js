import mongoose from 'mongoose';

const listingSchema=new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startingBid: {
        type: Number,
        required: true
    },
    currentBid: {
        type: Number,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    active:{
        type: Boolean,
        default: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // reference to User model
        required: true
    },
},{timestamps:true});

const Listing=mongoose.model('Listing',listingSchema); // listing model

export default Listing;