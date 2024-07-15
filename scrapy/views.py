from django.shortcuts import redirect, render
from django.http import HttpResponse
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time
from webdriver_manager.chrome import ChromeDriverManager
import json
import time
import pandas as pd
from openpyxl.workbook import Workbook
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import EmailMessage
from django.conf import settings
from . models import *
from django.contrib.auth.hashers import make_password, check_password

def homepage(request):
    signup_message = request.session.pop('signupmessage', None)
    login_message = request.session.pop('loginmessage', None)
    return render(request, 'index.html', {'signupmessage': signup_message,
                                          'loginmessage': login_message})
                                          
def signup(request):
    if request.method == "POST":
        fname = request.POST["fname"]
        lname = request.POST["lname"]
        email = request.POST["email"]
        pass1 = request.POST["pass1"]
        UserObject = Client(
            fname=fname,
            lname=lname,
            isLoggedIn=False,
            email=email,
            password=make_password(pass1),
            num_bots=10
        )
        try:
            UserObject.save()
        except:
            request.session['signupmessage'] = "This email already exists"
            return redirect(homepage)
        request.session['signupmessage'] = "Account created successfully" 
        return redirect(homepage)
    else:
        return redirect(homepage)

def login(request):
    if request.method == "POST":
        email = request.POST["email"]
        plain_password = request.POST["pass"]
        try:
            client = Client.objects.get(email=email)
        except Client.DoesNotExist:
            request.session['loginmessage'] = "This email doesnt exists, try signing up"
            return redirect(homepage)
        if check_password(plain_password,client.password):
            client.isLoggedIn = True
            client.save()
            request.session['useremail'] = email
            return redirect(dashboard)
        else:
            request.session['loginmessage'] = "Incorrect Credentials"
            return redirect(homepage)
    else: 
        return redirect(homepage)

def logout(request):
    # Set isloggedin false for user
    return redirect(homepage)

@csrf_exempt
def dashboard(request):
    if request.method == "POST":
        # form handling of the bot creation request
        n = int(request.POST["page"])
        query = request.POST["query"]
        usermail = request.POST["email"]
        query = query.split()
        query = "+".join(query)
        print(query)
        start = time.time()
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--window-size=1920x1080")
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()),options=chrome_options)
        List = {
            "AdText":[],
            "Advertiser":[],
            "Location":[]
        }
        for i in range(n):
            print(f"Page No: {i+1}")
            if i!=0:
                url = f"https://www.google.com/search?q={query}&start={i}0"
            else:
                url = f"https://www.google.com/search?q={query}&start=0"
            driver.get(url) 
            time.sleep(3)
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            adBox = driver.find_elements(By.CLASS_NAME,"uEierd")
            print(len(adBox))
            j = 0
            for ad in adBox:
                adtext = ad.text
                clickable = ad.find_element(By.XPATH,'.//div[@title="Why this ad?" and @aria-label="Why this ad?" and @role="button"]')
                driver.execute_script("arguments[0].click();", clickable)
                time.sleep(2)
                AdvertiserLoc = driver.find_elements(By.CLASS_NAME,"xZhkSd")
                AdvertiserName = AdvertiserLoc[0].text
                Location = AdvertiserLoc[1].text
                List["AdText"].append(adtext)
                List["Advertiser"].append(AdvertiserName)
                List["Location"].append(Location)
                webdriver.ActionChains(driver).send_keys(Keys.ESCAPE).perform()
                print(f"Completed AdDiv {j+1}")
                j += 1
        driver.quit()
        print("total time:", time.time() - start)
        df = pd.DataFrame(List)
        df.to_excel(f'scrapy/static/data/{query}+Ad+Advertiser.xlsx', index=False)
        file_path = f"scrapy/static/data/{query}+Ad+Advertiser.xlsx"
        # send_email_with_attachment(subject=f"Scraped Data file for {query}", body="test", to_email=usermail, file_path=file_path)
        return render(request,'dashboard.html')
    else:
        #for production add a check if user who tried /dashboard is logged in or not
        email = request.session.pop('useremail', None)
        if email:
            client = Client.objects.get(email=email)
            return render(request,'dashboard.html',{'client':client})
        else:
            return render(request,'dashboard.html')


# Email Send function
def send_email_with_attachment(subject, body, to_email, from_email=settings.EMAIL_HOST_USER, file_path=None):
    email = EmailMessage(
        subject,
        body,
        from_email,
        [to_email],
    )
    if file_path:
        email.attach_file(file_path)
    email.send()

