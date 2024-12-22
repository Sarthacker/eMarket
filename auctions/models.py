from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    pass

class Listing(models.Model):
    CATEGORIES = [
        ('EnG', "Electronics & Gadgets"),
        ('FnA', "Fashion & Apparel"),
        ('HnL', "Home & Living"),
        ('BnP', "Beauty & Personal Care"),
        ('SnF', "Sports & Fitness"),
        ('BnS', "Books & Stationery"),
        ('TnG', "Toys & Games"),
        ('HnW', "Health & Wellness"),
        ('KnD', "Kitchen & Dining"),
        ('JnA', "Jewelry & Accessories")
    ]
    title = models.CharField(max_length=32)
    description = models.TextField(max_length=200)
    currentBid = models.DecimalField(help_text="In Rupees (₹)", default=0.0, decimal_places=2, max_digits=12)
    image = models.ImageField(upload_to='images/',null=True, blank=True)
    category = models.CharField(max_length=3, choices=CATEGORIES, blank=True)
    listedBy = models.ForeignKey(User, on_delete=models.CASCADE, related_name="mylistings")
    listedOn = models.DateTimeField(auto_now_add=True)
    #onWatchlist = models.BooleanField(default=False)
    closed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.id}. {self.title}, {self.listedBy}"

class Bid(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bidOn = models.DateTimeField(auto_now_add=True)
    bidPrice = models.DecimalField(decimal_places=2, max_digits=12)

class Watchlist(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="watchlist")

class Comment(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    cmtMsg = models.TextField(blank=False)
    cmtOn = models.DateTimeField(null=True, auto_now_add=True)