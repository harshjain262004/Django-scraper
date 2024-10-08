from django.db import models

class Client(models.Model):
    userid = models.AutoField(primary_key=True)
    fname = models.CharField(max_length=30)
    lname = models.CharField(max_length=30)
    isLoggedIn = models.BooleanField(default=False)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100) 
    num_bots = models.PositiveIntegerField(default=0)

class Bot(models.Model):
    botid = models.AutoField(primary_key=True)
    user = models.ForeignKey(Client, related_name='bots', on_delete=models.CASCADE)
    query = models.CharField(max_length=255)
    pages = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=50) #StartBot 0% 10% ... Completed Error

class Data(models.Model):
    dataid = models.AutoField(primary_key=True)
    user = models.ForeignKey(Client, related_name='data', on_delete=models.CASCADE)
    bot = models.ForeignKey(Bot, related_name='data', on_delete=models.CASCADE)
    content = models.TextField()
    advertiser_name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    date_of_scraping = models.CharField(max_length=100)




