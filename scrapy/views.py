from datetime import date
from django.shortcuts import redirect, render
from django.http import HttpResponse, JsonResponse
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
from . models import Bot,Client,Data
from django.contrib.auth.hashers import make_password, check_password

def homepage(request):
    signup_message = request.session.pop('signupmessage', None)
    login_message = request.session.pop('loginmessage', None)
    if signup_message:
        context = True
    elif login_message:
        context = False
    else:
        context = True
    return render(request, 'index.html', {'signupmessage': signup_message,
                                          'loginmessage': login_message,
                                          'context': context})
                                          
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
        request.session['loginmessage'] = "Account created successfully" 
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

def logout(request,userid):
    email = request.session.pop('useremail', None)
    user = Client.objects.get(userid=userid)
    user.isLoggedIn = False
    user.save()
    request.session['loginmessage'] = "Logged out successfully"
    return redirect(homepage)

@csrf_exempt
def dashboard(request):
    email = request.session.pop('useremail', None)
    if email:
        client = Client.objects.get(email=email)
        bot = Bot.objects.filter(user=client)
        request.session['useremail'] = email
        return render(request,'dashboard.html',{'client':client,
                                                 'bots': bot})
    else:
        return redirect(homepage)

def dashboardForUser(request, user_id):
    client = Client.objects.get(userid = user_id)
    if client.isLoggedIn:
        request.session['useremail'] = client.email
        return redirect(dashboard)
    else:
        return redirect(homepage)

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

def DataShow(request,user_id,bot_id):
    client = Client.objects.get(userid=user_id)
    if client.isLoggedIn:
        bot = Bot.objects.get(botid=bot_id)
        data = Data.objects.filter(bot=bot)
        return render(request, 'datatable.html', {'bot': bot,
                                              'data':data,
                                              'client':client})
    else:
        return redirect(homepage)
    
#EndPoint API: dashboard/CreateBot
@csrf_exempt
def CreateBot(request):
    if request.method == "POST":
        CurrUser = Client.objects.get(userid = request.POST.get('userid'))
        if CurrUser.num_bots == 0:
            print("Not enough credits error")
            response_data = {
            'status': 'error',
            'message': 'Not Enough Credits',
            }
            return JsonResponse(response_data,status=403)
        new_bot = Bot(
            user=CurrUser,
            query=request.POST.get('query'),
            pages=int(request.POST.get('pages')),
            status=request.POST.get('status')
        )
        new_bot.save()
        CurrUser.num_bots -= 1
        CurrUser.save()
        response_data = {
            'status': 'success',
            'message': 'Data received successfully',
            'received_data': {
                'botid': new_bot.botid,
                'num_bots':CurrUser.num_bots
            }
        }
        print("NewBot Created")
        return JsonResponse(response_data,status=200)
    return redirect(homepage)

#EndPoint API: dashboard/StartBot
@csrf_exempt
def StartBot(request):
    if request.method == "POST":
        botid = request.POST.get('botId')
        print(f"Starting bot for: {botid}")
        ScrapeStatus = StartScrape(botid)
        bot = Bot.objects.get(botid=botid)
        response_data = {
            'status': 'success',
            'message': 'Data received successfully',
            'received_data': {
                'botid': botid,
                'pages': bot.pages,
                'BotStatus':bot.status,
                'error':ScrapeStatus
            }
        }
        return JsonResponse(response_data,status=200)
    return redirect(homepage)

#actual Scraping function
def StartScrape(botid):
    bot = Bot.objects.get(botid=botid)
    query = bot.query
    pages = bot.pages
    user = bot.user
    try:
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
        for i in range(pages):
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
                time.sleep(3)
                AdvertiserLoc = driver.find_elements(By.CLASS_NAME,"xZhkSd")
                if len(AdvertiserLoc) >= 2:
                    AdvertiserName = AdvertiserLoc[0].text
                    Location = AdvertiserLoc[1].text
                else:
                    AdvertiserName = "Not Available"
                    Location = "Not Available"
                newDataRow = Data(
                    user = user,
                    bot = bot,
                    content=adtext,
                    advertiser_name=AdvertiserName,
                    location=Location,
                    date_of_scraping = date.today()
                )
                newDataRow.save()
                List["AdText"].append(adtext)
                List["Advertiser"].append(AdvertiserName)
                List["Location"].append(Location)
                webdriver.ActionChains(driver).send_keys(Keys.ESCAPE).perform()
                print(f"Completed AdDiv {j+1}")
                j += 1
            stat = (i+1)/pages
            stat *= 100
            bot.status = f"{stat}%"
            bot.save()
        driver.quit()
    except Exception as e:
        print(e)
        bot.status = "Error"
        bot.save()
        user.num_bots += 1
        user.save()
        return str(e)
    bot.status = "Completed"
    bot.save()
    print("Total time:", time.time() - start)
    df = pd.DataFrame(List)
    df.to_excel(f'scrapy/static/data/{query}+Ad+Advertiser.xlsx', index=False)
    file_path = f"scrapy/static/data/{query}+Ad+Advertiser.xlsx"
    # send_email_with_attachment(subject=f"Scraped Data file for {query}", body="test", to_email=user.email, file_path=file_path)
    return "Completed"

# EndPoint API: dashboard/getRefreshList
@csrf_exempt 
def getRefreshList(request):
    if request.method == "POST":
        client = Client.objects.get(userid=request.POST.get("ClientId"))
        bots = Bot.objects.filter(user=client)
        response_data = {
            'status': 'success',
            'message': 'Data received successfully',
            'received_data': []
        }
        for bot in bots:
            response_data['received_data'].append({
            'id': bot.botid,
            'status': bot.status,
            'pages':bot.pages
            })
        return JsonResponse(response_data,status=200)
    return redirect(homepage)


#EndPoint API: dashboard/getFilteredBots
@csrf_exempt
def getFilteredBots(request):
    if request.method == "POST":
        keyword = request.POST.get("keyword").lower().strip()
        client = Client.objects.get(userid=request.POST.get("ClientId"))
        bots = Bot.objects.filter(user=client)
        ValidBots = []
        for bot in bots:
            if bot.query.lower().startswith(keyword):
                ValidBots.append(bot)
            elif keyword in bot.query.split():
                ValidBots.append(bot)
            else:
                for word in bot.query.split():
                    if word.lower().startswith(keyword):
                        ValidBots.append(bot)
                        continue
        response_data = {
            'status': 'success',
            'message': 'Data received successfully',
            'received_data': []
        }
        for bot in ValidBots:
            response_data['received_data'].append({
            'botid': bot.botid,
            'query': bot.query,
            'status': bot.status,
            'pages':bot.pages
            })
        return JsonResponse(response_data,status=200)
    else:
        return redirect(homepage)
