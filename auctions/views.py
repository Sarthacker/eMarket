from typing import Any
from django import forms
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from .models import *

class CreateListingForm(forms.ModelForm):
    class Meta:
        model = Listing
        fields = ['title', 'description', 'currentBid', 'image', 'category']
        widgets = {
                "description": forms.Textarea(attrs={
                'rows': 2, 
                'cols': 2, 
                'style': 'height: 100px; width: max-width; min-width: 40vw;'
            }),
            "image": forms.ClearableFileInput(attrs={
                'placeholder': "(optional)",
            }),
        }
        labels = {
            'title': 'Product Name',
            'description': 'Product Description',
            'currentBid': 'Starting Bid',
            'image': 'Product Image',
            'category': 'Product Category'
        }
        
class NewBidForm(forms.ModelForm):
    class Meta:
        model = Bid
        fields = ["bidPrice"]
        widgets = {
            "bidPrice": forms.NumberInput(attrs = {
                'placeholder': "Your Bid Amount",
                'min': 0.01
            })
        }
        labels = {
            'bidPrice': 'Amount'
        }

class NewCommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ["cmtMsg"]
        widgets = {
            "cmtMsg": forms.Textarea(attrs = {
                'placeholder': "Type in your comment",
                'style': 'height: 80px; width: max-width; min-width: 40vw;'
            })
        }
        labels = {
            'cmtMsg': 'Leave a comment'
        }

def index(request):
    return render(request, "auctions/index.html", {
        "listings": Listing.objects.filter(closed=False).order_by('-listedOn')
    })

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        #To check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")

@login_required(login_url="login")
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")

@login_required(login_url="login")
def create_listing(request):
    if request.method == "POST":
        createListingForm = CreateListingForm(request.POST, request.FILES)
        if createListingForm.is_valid():
            listing = Listing(
                title = createListingForm.cleaned_data["title"],
                description = createListingForm.cleaned_data["description"],
                image = createListingForm.cleaned_data["image"],
                currentBid = createListingForm.cleaned_data["currentBid"],
                category = createListingForm.cleaned_data["category"],
                listedBy = User.objects.get(id=request.user.id)
            )
            listing.save()
            return HttpResponseRedirect(reverse("index"))
        
        return render(request, "auctions/create_listing.html", {"form": createListingForm})

    else:
        return render(request, "auctions/create_listing.html", {"form": CreateListingForm()})

def listing_view(request, pid):
    try:
        listing = Listing.objects.get(pk=pid)
    except Listing.DoesNotExist:
        return render(request, "auctions/error/404.html")
    
    totalBids = Bid.objects.filter(listing=listing.id).count()
    highestBid = Bid.objects.filter(listing=listing.id).order_by('-bidPrice').first()

    if(listing.closed):
        if (highestBid is not None):
            buyer = highestBid.user

            return render(request, "auctions/sold.html", {
                "isSeller": request.user.id == listing.listedBy.id,
                "isBuyer": request.user.id == buyer.id,
                "buyer": buyer,
                "product": listing
            })
        
        elif request.user.id == listing.listedBy.id:
            return render(request, "auctions/sold.html", {
                "isSeller": True,
                "noBid": True,
                "product": listing
            })
        
        else:
            return HttpResponse("Auction no longer exists!..")
    else:
        if highestBid is not None:
            if highestBid.user == request.user.id:
                bidMsg = "Your bid is the highest bid"
            else:
                bidMsg = "Highest bid made by " + highestBid.user.username
        else:
            bidMsg = None
            
        onWatchlist = False
        if request.user.is_authenticated:
            inWatchlist = Watchlist.objects.filter(listing=listing, user=User.objects.get(id=request.user.id)).first()
            onWatchlist = inWatchlist is not None

        return render(request, "auctions/listing.html", {
            "product": listing,
            "totalBids": totalBids,
            "bidMsg": bidMsg,
            "bidForm": NewBidForm(),
            "onWatchlist": onWatchlist,
            "commentForm": NewCommentForm(),
            "comments": Comment.objects.filter(listing=pid).order_by("-cmtOn")
        })

@login_required(login_url="login")
def close_auction(request, pid):
    try:
        listing = Listing.objects.get(pk=pid)
    except Listing.DoesNotExist:
        return render(request, "auctions/error/404.html")
    if request.method == "POST":
        listing.closed=True
        listing.save()
        return HttpResponseRedirect(reverse("listing", args=[listing.id]))
    
    return HttpResponse("Access denied!. You are not allowed to visit this page.")

@login_required(login_url="login")   
def add_watchlist(request, pid):
    try:
        listing = Listing.objects.get(pk=pid)
    except Listing.DoesNotExist:
        return render(request, "auctions/error/404.html")
    if request.method == "POST":
        if ("ADD" in request.POST.get("watchlistBtn")):
            try:
                watchlistListing = Watchlist(
                    listing=listing, 
                    user=User.objects.get(id=request.user.id)
                )
                watchlistListing.save()
            except IntegrityError:
                return render(request, "auctions/invalid_method.html", {
                    "err_msg": "Product already on your watchlist.",
                    "prod_id": pid
                })
        elif ("DELETE" in request.POST.get("watchlistBtn")):
            watchlistListing = Watchlist.objects.filter(
                listing=listing, 
                user=User.objects.get(id=request.user.id)
            ).first()
            watchlistListing.delete()
        return HttpResponseRedirect(reverse("listing", args=[listing.id]))
    
    return HttpResponse("Access denied!. You are not allowed to visit this page.")

@login_required(login_url="login")
def new_bid(request, pid):
    try:
        listing = Listing.objects.get(pk=pid)
    except Listing.DoesNotExist:
        return render(request, "auctions/error/404.html")
    
    if request.method == "POST":
        newBidForm = NewBidForm(request.POST)
        if newBidForm.is_valid():
            bidPrice = float(newBidForm.cleaned_data["bidPrice"])
            bidBy = User.objects.get(id=request.user.id)

            if bidPrice < 0 or listing.listedBy == bidBy:
                return HttpResponse("Error Occured! Try again...")
            
            highestBid = Bid.objects.filter(listing=listing).order_by('-bidPrice').first()
            if (highestBid is not None and bidPrice <= highestBid.bidPrice) or bidPrice <= listing.currentBid:
                return render(request, "auctions/error/invalid_method.html", {
                    "err_msg": "Make a bid higher than the current price.",
                    "prod_id": pid
                })

            newBid = Bid(listing=listing, bidPrice=bidPrice, user=bidBy)
            listing.currentBid = bidPrice
            newBid.save()
            listing.save()

            return HttpResponseRedirect(reverse("listing", args=[pid]))

        return render(request, reverse("listing", args=[pid]), {
            "bidForm": newBidForm
        })
    
    return HttpResponse("Access denied!. You are not allowed to visit this page.") 

@login_required(login_url="login")
def watchlist(request):
    watchlistIdList = User.objects.get(id=request.user.id).watchlist.values_list("listing")
    watchlistItems = Listing.objects.filter(id__in=watchlistIdList, closed=False)
    return render(request, "auctions/watchlist.html", {
        "listings": watchlistItems.order_by('-listedOn')
    })

@login_required(login_url="login")
def post_comment(request, pid):
    try:
        listing = Listing.objects.get(pk=pid)
    except Listing.DoesNotExist:
        return render(request, "auctions/error/404.html")
    
    if request.method == "POST":
        newCommentForm = NewCommentForm(request.POST)
        if newCommentForm.is_valid():
            cmt = Comment(
                listing=listing, 
                user=User.objects.get(id=request.user.id), 
                cmtMsg=newCommentForm.cleaned_data["cmtMsg"]
            )
            cmt.save()

            return HttpResponseRedirect(reverse("listing", args=[pid]))

        return render(request, reverse("listing", args=[pid]), {
            "commentForm": newCommentForm
        })
    
    return HttpResponse("Access denied!. You are not allowed to visit this page.") 

def category(request, cid=None):
    if cid is None:
        return render(request, "auctions/error/404.html")
    
    categories = [x[1] for x in Listing.CATEGORIES]
    catIDs = [x[0] for x in Listing.CATEGORIES]

    if cid in catIDs:
        cat = categories[catIDs.index(cid)]
        listings = Listing.objects.filter(category=cid, closed=False)
        return render(request, "auctions/category.html", {
            "listings": listings,
            "category": cat
        })
    else:
        return render(request, "auctions/invalid_method.html", {
            "err_msg": "The Category seems to be invalid."
        })

def closed(request):
    return render(request, "auctions/closed.html", {
        "listings": Listing.objects.filter(closed=True).order_by('-listedOn')
    })