# 🛍️ eMarket – Online Auction Platform  
Welcome to **eMarket**, a dynamic and modern **online auction platform** built using **Node.js**, **Express**, **MongoDB**, and **ReactJS**.  eMarket connects **buyers and sellers** through auctions — allowing users to **list items**, **bid competitively**, and **buy their favorite products** 🎯 

---
## ✨ Features

### 👤 User Authentication
- Secure **login** and **signup** system with JWT and Express-Session
- Personalized dashboard showing **My Listings** 

### 📦 Listing Management
- Create and edit your product listings  
- Upload product images with **live preview**  
- End your auction anytime with a single click 🔚  

### 💸 Real-Time Bidding
- Place bids on active items  
- Automatically show the **current highest bid** and **bidder**   

### 🕓 Auction Lifecycle
- Active and Ended auctions displayed in separate sections on the home page  
- Items automatically move to the “Finished Auctions” section once ended  

### 💻 Responsive Interface
- Built with **Tailwind CSS** for a sleeky design  
- Smooth navigation between pages  
---

## 🛠️ Tech Stack

| Category | Technology |
|-----------|-------------|
| Backend | Node.js, Express.js (ES6) |
| Database | MongoDB Atlas |
| Frontend | ReactJS (Vite), Tailwind CSS |
| Authentication | Express-Session and JWT |
| File Uploads | Multer |
| Runtime | Node.js (v22) |

---

## 🚀 Getting Started (Run Locally)

Follow these steps to set up eMarket on your local machine 👇  

### 1️⃣ Clone the repository
```bash
git clone https://github.com/sarthacker/eMarket.git
cd eMarket
```
### 2️⃣ Configure environment variables
Create a ```.env``` file in the root directory and add:
```bash
JWT_SECRET=your_secret_key
DB=your_mongodb_connection_string
PORT=3000
```
### 3️⃣ Run the backend
```bash
cd backend
npm install
node index
```
Backend runs at:
```bash
http://localhost:3000
```
### 4️⃣ Run the frontend
```bash
cd frontend
npm install
nom run dev
```
Frontend runs at:
```bash
http://localhost:5173
```
### 5️⃣ Open in browser
```bash
http://localhost:5173
```
