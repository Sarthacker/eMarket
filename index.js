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


// auth middlewares
async function auth(request,response,next){
  const token = request.cookies.authToken;
  if(!token){
    console.log("No one is logged in");
    return response.redirect('/login');
  }
  jwt.verify(token,JWT_SECRET,(error,user)=>{
    if(error){
      console.error(error);
      return response.redirect('/login');
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

// Routes
app.route('/login')
  .get(async (request,response)=>{
    return response.render('login',{error:null});
  })
  .post(async (request,response)=>{
    const {username,password}=request.body;

    try{
      const user=await User.findOne({username:username});
      if(!user){
        return response.render('login', { error: 'Invalid username or password' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return response.render('login', { error: 'Invalid username or password' });
      }

      const token=jwt.sign({
        username:username,
      },JWT_SECRET);

      response.cookie('authToken', token, {
        httpOnly: true,
        maxAge: 7 * 1000 * 60 * 60 * 24, // 7 days
        sameSite: 'strict'
      });

      return response.redirect('/'); 
    }
    catch(error){
      console.error(`Login Failed: ${error}`);
    }
  });

app.route('/signup')
  .get(async (request,response)=>{
    return response.render('signup', { error: null });
  })
  .post(async (request,response)=>{
    const { username, password,confirmPassword } = request.body;
    if(password!==confirmPassword){
      return response.render('signup', {error: "Passwords do not match"});
    }
    try{
      const existingUser=await User.findOne({username});
      if(existingUser){
        return response.render('signup', {error: 'Username already exists'});
      }

      const hashedPassword=await bcrypt.hash(password,10);

      const newUser=new User({
        username,
        password:hashedPassword,
      })
      await newUser.save();
      return response.redirect('/login');

    }
    catch(error){
      console.error(`Signup Failed: ${error}`);
      return response.render('signup', { error:'An error occurred. Please try again.'});
    }
  });

// Logout
app.get('/logout', (request, response) => {
  response.clearCookie('authToken');
  return response.redirect('/');
});

app.get('/',async (request,response)=>{
  try{
    const items=await Listing.find().sort({createdAt:-1}); // latest listings
    const activeItems = await Listing.find({ active: true});
    const finishedItems = await Listing.find({ active: false});
    return response.render('index',{items,activeItems,finishedItems});
  }
  catch(error){
    console.error(`Request Failed: ${error}`);
    return response.status(500).send('Error loading page');
  }
});

app.get('/create',auth, (request,response)=>{
    return response.render('create');
});

app.post("/form-submitted", auth, upload.single('image'), async (request, response) => {
  try {
    const { name, description, startingBid, endDate } = request.body;

    const parsedDate = new Date(endDate);
    const username=response.locals.user.username
    const user=await User.findOne({username});

    const newListing = new Listing({
      name,
      description,
      startingBid,
      currentBid: startingBid,
      endDate: parsedDate,
      image: request.file ? `/uploads/${request.file.filename}` : null,
      userId:user._id
    });
    await newListing.save(); // new item has been added to the db

    await User.findByIdAndUpdate(
     user._id,
     { $addToSet: { listings: newListing._id } }, // avoids duplicates
     { new: true }
    );

    return response.redirect('/'); // Redirect to home page with success
  } 
  catch(error){
    console.error(error);
    return response.status(500).render('create', { error: 'Error creating listing' });
  }
});

// Full content of each item
app.route('/item/:id') 
    .get(auth,async (request,response)=>{
        try{
            const item = await Listing.findById(request.params.id);
            if (!item) {
              return response.status(404).render('no-item');
            }
            const listedBy=await User.findById(item.userId);
            const highestBid = await Bid.findOne({ listingId: request.params.id})
                .sort({ price: -1 })
                .populate('userId') // assuming userId is a ref to User model
                .exec();
            const highestBidingUser = highestBid ? await User.findById(highestBid.userId) : listedBy;
            // Item not found
            return response.render('item',{item,listedBy,highestBidingUser});
        }
        catch(error){
            console.error(`Request Failed: ${error}`);
            return response.status(404).render('no-item');
        }
    })
    .post(auth,async (request,response)=>{
        const bidAmount=request.body.bidAmount;
        const username=response.locals.user.username
        const user=await User.findOne({username});
        try{
            await Listing.findByIdAndUpdate(request.params.id,{
                $set:{
                    currentBid:bidAmount
                },
            },{new:true});
            const item = await Listing.findById(request.params.id);
            const listedBy=await User.findById(item.userId);
            const newBid=new Bid({
              price:bidAmount,
              userId:user._id,
              listingId:request.params.id
            });
            await newBid.save();
            const highestBid = await Bid.findOne({ listingId: request.params.id })
                .sort({ price: -1 })
                .populate('userId')
                .exec();
            const highestBidingUser = highestBid ? await User.findById(highestBid.userId) : listedBy;
            
            return response.render('item',{item,listedBy,highestBidingUser});
        }
        catch(error){
            console.error(`Bidding Failed: ${error}`);
            return response.status(500).send('Error bidding on the item');
        }
    });

app.get('/my-listings',async (request,response)=>{
  const username=response.locals.user.username;
  const user = await User.findOne({username}).populate("listings");
  const listings=user.listings;
  console.log(listings);
  return response.render('my-listings',{listings});
});

app.get('/item/:id/end',async(request,response)=>{
  const item=await Listing.findById(request.params.id);
  const listedBy= await User.findById(item.userId);
  if(listedBy.username!=response.locals.user.username){
    console.log("Unauthorized access!!");
    return response.status(401).render('cannot-end.ejs');
  }
  await Listing.findByIdAndUpdate(request.params.id,{
      $set:{
          active:false
      },
  },{new:true});
  return response.redirect(`/item/${request.params.id}`);
});

app.route('/item/:id/edit',auth)
  .get(async(request,response)=>{
    const item=await Listing.findById(request.params.id);
    const listedBy= await User.findById(item.userId);
    if(listedBy.username!=response.locals.user.username){
      console.log("Unauthorized access!!");
      return response.status(401).render('cannot-edit.ejs');
    }
    return response.render('edit-item',{item});
  })
  .post(upload.single('image'),async(request,response)=>{
    const item = await Listing.findById(request.params.id);
    const listedBy= await User.findById(item.userId);
    if(listedBy.username!=response.locals.user.username){
      console.log("Unauthorized access!!");
      return response.status(401).render('cannot-edit.ejs');
    }
    try{
        const { name, description, startingBid, endDate } = request.body;
        const parsedDate = new Date(endDate);
      
        // updations
        item.name=name;
        item.description=description;
        item.startingBid=startingBid;
        item.endDate=parsedDate;
        if(request.file){
          item.image=`/uploads/${request.file.filename}`;
        }

        await item.save();
        return response.redirect(`/item/${request.params.id}`);
    }
    catch(error){
        console.error(`Update Failed: ${error}`);
        return response.status(500).send('Error updating the item');
    }
  });

app.get('/about',(request,response)=>{
  return response.render('about');
});

app.use((request,response)=>{
    return response.status(404).render('404',{title:'Page Not Found'});
});