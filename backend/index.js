import express, { response } from 'express';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import cors from 'cors';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const JWT_SECRET=process.env.JWT_SECRET;
const db=process.env.DB;
const port=process.env.PORT || 3000;

export const app=express();
app.use(morgan('dev'));
app.set('view engine','ejs');
app.use(express.urlencoded({ extended: true })); // For form data
app.use(express.json()); // For JSON data
app.use(cookieParser());

// CORS configuration for React frontend
app.use(cors({
    origin: [
    "http://localhost:5173",  // local dev
    "https://e-market-brown.vercel.app"  // Vercel URL (no trailing slash!)
  ],
  credentials: true // Allow cookies to be sent
}));

// serve public folder
app.use(express.static(path.join(__dirname, 'public')));


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Save images to public/uploads/
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

import Listing from './models/listings.js';
import User from './models/user.js';
import Bid from './models/bid.js'
import { request } from 'http';

// Connect to db
mongoose.connect(db) // async method
  .then((response)=> {
    // listen for requests
    app.listen(port);
    console.log(`Server running at http://127.0.0.1:${port}`)
    console.log(`Connected to db: ${response}`)
  })
  .catch((error)=> console.error(`Can't connect to the db: ${error}`));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// auth middlewares
async function auth(request,response,next){
  const token = request.cookies.authToken;
  if(!token){
    console.log("No one is logged in");
    return response.status(401).json({ error: 'Not authenticated' });
  }
  jwt.verify(token,JWT_SECRET,(error,user)=>{
    if(error){
      console.error(error);
      return response.status(401).json({ error: 'Invalid token' });
    }
    request.user=user;
    console.log(`${user.username} has logged in`);
    next();
  });
}

app.use((request, response, next) => {
  const token = request.cookies.authToken;
  if(token){
    jwt.verify(token, JWT_SECRET, (error, user) => {
      if (!error) {
        response.locals.user = user; // makes user available to all views
        response.locals.isLoggedIn = true;
      }
      else {
        response.locals.user = null;
        response.locals.isLoggedIn = false;
      }
      next();
    });
  }
  else {
    response.locals.user = null;
    response.locals.isLoggedIn = false;
    next();
  }
});

// API Routes
app.post('/api/login', async (request,response)=>{
  const {username,password}=request.body;

  try{
    const user=await User.findOne({username:username});
    if(!user){
      return response.status(401).json({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return response.status(401).json({ error: 'Invalid username or password' });
    }

    const token=jwt.sign({
      username:username,
    },JWT_SECRET);

    response.cookie('authToken', token, {
      httpOnly: true,
      maxAge: 7 * 1000 * 60 * 60 * 24, // 7 days
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production' // Required for cross-domain cookies
    });

    return response.json({ message: 'Login successful', user: { username } });
  }
  catch(error){
    console.error(`Login Failed: ${error}`);
    return response.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/signup', async (request,response)=>{
  const { username, password, confirmPassword } = request.body;
  if(password !== confirmPassword){
    return response.status(400).json({ error: 'Passwords do not match' });
  }
  try{
    const existingUser=await User.findOne({username});
    if(existingUser){
      return response.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword=await bcrypt.hash(password,10);

    const newUser=new User({
      username,
      password:hashedPassword,
    })
    await newUser.save();
    return response.status(201).json({ message: 'Signup successful' });

  }
  catch(error){
    console.error(`Signup Failed: ${error}`);
    return response.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// Check auth status
app.get('/api/auth/status', (request, response) => {
  const token = request.cookies.authToken;
  if (!token) {
    return response.json({ isLoggedIn: false, user: null });
  }
  jwt.verify(token, JWT_SECRET, (error, user) => {
    if (error) {
      return response.json({ isLoggedIn: false, user: null });
    }
    return response.json({ isLoggedIn: true, user: { username: user.username } });
  });
});

// Logout
app.post('/api/logout', (request, response) => {
  response.clearCookie('authToken');
  return response.json({ message: 'Logged out successfully' });
});

// Get all listings
app.get('/api/listings', async (request,response)=>{
  try{
    const items = await Listing.find().sort({createdAt:-1}); // latest listings
    const activeItems = await Listing.find({ active: true });
    const finishedItems = await Listing.find({ active: false });
    return response.json({ items, activeItems, finishedItems });
  }
  catch(error){
    console.error(`Request Failed: ${error}`);
    return response.status(500).json({ error: 'Error loading listings' });
  }
});

// Create new listing
app.post('/api/listings', auth, upload.single('image'), async (request, response) => {
  try {
    const { name, description, startingBid, endDate } = request.body;

    const parsedDate = new Date(endDate);
    const username = request.user.username;
    const user = await User.findOne({username});

    const newListing = new Listing({
      name,
      description,
      startingBid,
      currentBid: startingBid,
      endDate: parsedDate,
      image: request.file ? `/uploads/${request.file.filename}` : null,
      userId: user._id
    });
    await newListing.save();

    await User.findByIdAndUpdate(
     user._id,
     { $addToSet: { listings: newListing._id } },
     { new: true }
    );

    return response.status(201).json({ message: 'Listing created', listing: newListing });
  } 
  catch(error){
    console.error(error);
    return response.status(500).json({ error: 'Error creating listing' });
  }
});

// Get single item
app.get('/api/listings/:id', async (request,response)=>{
  try{
    const item = await Listing.findById(request.params.id);
    if (!item) {
      return response.status(404).json({ error: 'Item not found' });
    }
    const listedBy = await User.findById(item.userId);
    const highestBid = await Bid.findOne({ listingId: request.params.id })
      .sort({ price: -1 })
      .populate('userId')
      .exec();
    const highestBidingUser = highestBid ? await User.findById(highestBid.userId) : listedBy;
    
    return response.json({
      item,
      listedBy: { username: listedBy?.username },
      highestBidingUser: { username: highestBidingUser?.username }
    });
  }
  catch(error){
    console.error(`Request Failed: ${error}`);
    return response.status(404).json({ error: 'Item not found' });
  }
});

// Place a bid
app.post('/api/listings/:id/bid', auth, async (request,response)=>{
  const bidAmount = request.body.bidAmount;
  const username = request.user.username;
  const user = await User.findOne({username});
  try{
    await Listing.findByIdAndUpdate(request.params.id,{
      $set:{ currentBid: bidAmount },
    },{new:true});
    
    const item = await Listing.findById(request.params.id);
    const listedBy = await User.findById(item.userId);
    const newBid = new Bid({
      price: bidAmount,
      userId: user._id,
      listingId: request.params.id
    });
    await newBid.save();
    
    const highestBid = await Bid.findOne({ listingId: request.params.id })
      .sort({ price: -1 })
      .populate('userId')
      .exec();
    const highestBidingUser = highestBid ? await User.findById(highestBid.userId) : listedBy;
    
    return response.json({
      message: 'Bid placed successfully',
      item,
      listedBy: { username: listedBy?.username },
      highestBidingUser: { username: highestBidingUser?.username }
    });
  }
  catch(error){
    console.error(`Bidding Failed: ${error}`);
    return response.status(500).json({ error: 'Error bidding on the item' });
  }
});

// Get user's listings
app.get('/api/my-listings', auth, async (request,response)=>{
  try {
    const username = request.user.username;
    const user = await User.findOne({username}).populate('listings');
    const listings = user.listings;
    return response.json({ listings });
  } catch(error) {
    console.error(`Request Failed: ${error}`);
    return response.status(500).json({ error: 'Error loading listings' });
  }
});

// End a listing
app.post('/api/listings/:id/end', auth, async(request,response)=>{
  try {
    const item = await Listing.findById(request.params.id);
    const listedBy = await User.findById(item.userId);
    if(listedBy.username !== request.user.username){
      console.log("Unauthorized access!!");
      return response.status(401).json({ error: 'Unauthorized' });
    }
    await Listing.findByIdAndUpdate(request.params.id,{
      $set:{ active: false },
    },{new:true});
    return response.json({ message: 'Listing ended successfully' });
  } catch(error) {
    console.error(`End Failed: ${error}`);
    return response.status(500).json({ error: 'Error ending listing' });
  }
});

// Get item for editing
app.get('/api/listings/:id/edit', auth, async(request,response)=>{
  try {
    const item = await Listing.findById(request.params.id);
    const listedBy = await User.findById(item.userId);
    if(listedBy.username !== request.user.username){
      return response.status(401).json({ error: 'Unauthorized' });
    }
    return response.json({ item });
  } catch(error) {
    return response.status(500).json({ error: 'Error loading item' });
  }
});

// Update a listing
app.put('/api/listings/:id', auth, upload.single('image'), async(request,response)=>{
  try {
    const item = await Listing.findById(request.params.id);
    const listedBy = await User.findById(item.userId);
    if(listedBy.username !== request.user.username){
      return response.status(401).json({ error: 'Unauthorized' });
    }
    
    const { name, description, startingBid, endDate } = request.body;
    const parsedDate = new Date(endDate);
    
    item.name = name;
    item.description = description;
    item.startingBid = startingBid;
    item.endDate = parsedDate;
    if(request.file){
      item.image = `/uploads/${request.file.filename}`;
    }

    await item.save();
    return response.json({ message: 'Listing updated', item });
  }
  catch(error){
    console.error(`Update Failed: ${error}`);
    return response.status(500).json({ error: 'Error updating the item' });
  }
});

// 404 handler for API routes
app.use('/api/{*path}', (request,response)=>{
  return response.status(404).json({ error: 'API endpoint not found' });
});

// Serve React app in production (optional - for when you build and deploy)
// app.use(express.static(path.join(__dirname, 'frontend/dist')));
// app.get('*', (request, response) => {
//   response.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
// });