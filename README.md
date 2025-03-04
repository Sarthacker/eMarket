# 🛒 Auction-Based E-Marketplace

An online auction platform where users can list products for bidding, place bids, and engage in competitive bidding to win items.

## 📌 Features

- **User Authentication:** Sign up, log in, and log out functionality.
- **Create Listings:** Users can list products for auction with descriptions and images.
- **Image Uploads:** Each listing supports user-uploaded images.
- **Bidding System:** Users can place bids on active listings.
- **Comment Section:** Users can comment on listings to discuss or ask questions.
- **Watchlist:** Users can save listings to their watchlist for later tracking.
- **Auction Closure:** The listing owner can close an auction whenever they are getting the required price.
- **Real-time Updates:** Display the highest bid and number of participants dynamically.

## 🛠️ Tech Stack

- **Backend:** Django (Python)
- **Frontend:** HTML, CSS, Bootstrap
- **Database:** SQLite (Default), MySQL
- **Authentication:** Django Authentication

## 🚀 Installation & Setup

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/Sarthacker/eMarket.git
cd eMarket
```

### **2️⃣ Create a Virtual Environment**
```sh
python -m venv venv
source venv/bin/activate  # On macOS/Linux
venv\Scripts\activate  # On Windows
```

### **3️⃣ Install Dependencies**
```sh
pip install -r requirements.txt
```

### **4️⃣ Apply Database Migrations**
```sh
python manage.py makemigrations
python manage.py migrate
```

### **5️⃣ Run the Development Server**
```sh
python manage.py runserver
```
