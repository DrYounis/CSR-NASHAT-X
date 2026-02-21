# 📚 أمثلة تطبيقية

**حالات استخدام واقعية مع حلولها**

---

## 🎯 السيناريو 1: الاستخدام الشخصي البسيط

### الموقف:
أريد نشر تغريدة يومياً من حاسوبي الشخصي

### الحل:
```bash
# 1. تشغيل البوت
python ramadan_bot.py

# 2. اختر الخيار 4 (النشر التلقائي)
# 3. اترك Terminal مفتوحاً
# 4. البوت سينشر تلقائياً كل يوم في الساعة 21:00
```

### ملاحظات:
- ✅ سهل ومباشر
- ⚠️ يجب بقاء الحاسوب مشغلاً
- ⚠️ يجب بقاء Terminal مفتوحاً

---

## 🎯 السيناريو 2: التشغيل على Raspberry Pi

### الموقف:
أريد بوت يعمل 24/7 دون استهلاك كبير للكهرباء

### الحل:
```bash
# 1. على Raspberry Pi
sudo apt update
sudo apt install python3 python3-pip

# 2. رفع المشروع
scp ramadan_sports_bot.zip pi@192.168.1.100:~/
ssh pi@192.168.1.100

# 3. التثبيت
unzip ramadan_sports_bot.zip
cd ramadan_sports_bot
./setup.sh

# 4. تشغيل دائم مع screen
screen -S ramadan
python ramadan_bot.py
# اختر 4
# اضغط Ctrl+A ثم D للخروج
```

### المميزات:
- ✅ استهلاك قليل للكهرباء (~5W)
- ✅ يعمل 24/7
- ✅ رخيص ($35 لمرة واحدة)

---

## 🎯 السيناريو 3: سيرفر VPS احترافي

### الموقف:
أريد حل احترافي مع مراقبة وإعادة تشغيل تلقائية

### الحل:
```bash
# 1. على VPS (Ubuntu/Debian)
ssh user@your-server.com

# 2. التثبيت
git clone your-repo.git
cd ramadan_sports_bot
./setup.sh

# 3. إعداد systemd
sudo cp systemd/ramadan-bot.service /etc/systemd/system/
sudo nano /etc/systemd/system/ramadan-bot.service
# عدّل المسارات واسم المستخدم

# 4. التشغيل كخدمة
sudo systemctl daemon-reload
sudo systemctl enable ramadan-bot
sudo systemctl start ramadan-bot

# 5. المراقبة
sudo systemctl status ramadan-bot
sudo journalctl -u ramadan-bot -f
```

### المميزات:
- ✅ إعادة تشغيل تلقائية عند الأعطال
- ✅ تشغيل عند إعادة تشغيل السيرفر
- ✅ سجلات كاملة
- ✅ مراقبة احترافية

---

## 🎯 السيناريو 4: تشغيل على Windows بدون Terminal

### الموقف:
أريد البوت يعمل في الخلفية على Windows بدون نوافذ

### الحل:

**1. أنشئ ملف `run_hidden.vbs`:**
```vbscript
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "python ramadan_bot.py --auto", 0, False
```

**2. أنشئ ملف `ramadan_bot_auto.py`:**
```python
# نسخة تلقائية
from ramadan_bot import RamadanSportsBot

bot = RamadanSportsBot()
bot.schedule_daily_post()
```

**3. تشغيل:**
- انقر نقراً مزدوجاً على `run_hidden.vbs`
- البوت سيعمل في الخلفية

**4. إيقاف:**
- Task Manager → Python → End Task

### المميزات:
- ✅ لا نوافذ ظاهرة
- ✅ تشغيل بنقرة واحدة
- ⚠️ يجب إضافته لـ Startup للتشغيل التلقائي

---

## 🎯 السيناريو 5: اختبار قبل رمضان

### الموقف:
رمضان لم يبدأ بعد، أريد اختبار البوت

### الحل:
```bash
# 1. تشغيل البوت
python ramadan_bot.py

# 2. اختر 1 (اختبار)
# 3. جرب أيام مختلفة
أدخل رقم اليوم: 1
أدخل رقم اليوم: 15
أدخل رقم اليوم: 30

# 4. تحقق من الأطوال
python test_tweets.py
# اختر 1 (اختبار جميع التغريدات)
```

### الفائدة:
- ✅ التأكد من جاهزية كل شيء
- ✅ اكتشاف الأخطاء مبكراً
- ✅ تعديل المحتوى إذا لزم

---

## 🎯 السيناريو 6: حسابات متعددة

### الموقف:
أريد تشغيل البوت على 3 حسابات X مختلفة

### الحل:

**1. هيكلية المجلدات:**
```
ramadan_bots/
├── account1/
│   ├── .env          (مفاتيح الحساب 1)
│   ├── content.json
│   └── ramadan_bot.py
├── account2/
│   ├── .env          (مفاتيح الحساب 2)
│   ├── content.json
│   └── ramadan_bot.py
└── account3/
    ├── .env          (مفاتيح الحساب 3)
    ├── content.json
    └── ramadan_bot.py
```

**2. تشغيل كل حساب:**
```bash
# Terminal 1
cd account1
python ramadan_bot.py  # خيار 4

# Terminal 2
cd account2
python ramadan_bot.py  # خيار 4

# Terminal 3
cd account3
python ramadan_bot.py  # خيار 4
```

**3. أو استخدم screen:**
```bash
screen -S bot1 -dm bash -c "cd account1 && python ramadan_bot.py --auto"
screen -S bot2 -dm bash -c "cd account2 && python ramadan_bot.py --auto"
screen -S bot3 -dm bash -c "cd account3 && python ramadan_bot.py --auto"
```

---

## 🎯 السيناريو 7: نشر في وقتين مختلفين

### الموقف:
أريد نشر تغريدة الصبح 9:00 ص وأخرى المساء 9:00 م

### الحل:

**1. عدّل `ramadan_bot.py`:**
```python
def schedule_dual_post(self):
    """جدولة نشر مرتين يومياً"""
    schedule.every().day.at("09:00").do(self.morning_post)
    schedule.every().day.at("21:00").do(self.evening_post)
    
    print("⏰ جدولة صباحية: 09:00")
    print("⏰ جدولة مسائية: 21:00")
    
    while True:
        schedule.run_pending()
        time.sleep(60)

def morning_post(self):
    """منشور الصباح - حديث فقط"""
    # نشر حديث اليوم
    pass

def evening_post(self):
    """منشور المساء - نصيحة رياضية"""
    # نشر نصيحة اليوم
    pass
```

**2. أو استخدم content_morning.json و content_evening.json**

---

## 🎯 السيناريو 8: إضافة صور تلقائياً

### الموقف:
أريد إضافة صورة جميلة لكل تغريدة

### الحل:

**1. جهّز الصور:**
```
images/
├── day1.jpg
├── day2.jpg
├── ...
└── day30.jpg
```

**2. عدّل `content.json`:**
```json
{
  "day": 1,
  "hadith": "...",
  "reference": "...",
  "tip": "...",
  "image": "images/day1.jpg"
}
```

**3. عدّل `ramadan_bot.py`:**
```python
def post_tweet(self, day, dry_run=False):
    # ...
    
    # رفع الصورة
    media = None
    if 'image' in hadith_data:
        media = self.client.media_upload(hadith_data['image'])
    
    # النشر مع الصورة
    response = self.client.create_tweet(
        text=tweet_text,
        media_ids=[media.media_id] if media else None
    )
```

---

## 🎯 السيناريو 9: إشعار Telegram عند النشر

### الموقف:
أريد إشعار على Telegram كلما نُشرت تغريدة

### الحل:

**1. أنشئ بوت Telegram:**
- ابحث عن @BotFather
- أنشئ بوت جديد
- احصل على TOKEN

**2. عدّل `.env`:**
```
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

**3. عدّل `ramadan_bot.py`:**
```python
import requests

def send_telegram_notification(self, message):
    """إرسال إشعار Telegram"""
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    chat_id = os.getenv('TELEGRAM_CHAT_ID')
    
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    data = {"chat_id": chat_id, "text": message}
    requests.post(url, data=data)

def post_tweet(self, day, dry_run=False):
    # ...
    try:
        response = self.client.create_tweet(text=tweet_text)
        print(f"✅ نُشرت تغريدة اليوم {day}")
        
        # إشعار Telegram
        self.send_telegram_notification(
            f"✅ تم نشر تغريدة اليوم {day} من رمضان\n"
            f"🔗 https://twitter.com/user/status/{response.data['id']}"
        )
    except Exception as e:
        self.send_telegram_notification(f"❌ خطأ: {str(e)}")
```

---

## 🎯 السيناريو 10: نسخ احتياطي تلقائي يومي

### الموقف:
أريد نسخة احتياطية تلقائية كل يوم

### الحل:

**على Linux/Mac (cron):**
```bash
# افتح crontab
crontab -e

# أضف سطر للنسخ الاحتياطي اليومي الساعة 23:00
0 23 * * * cd /path/to/ramadan_sports_bot && ./backup.sh
```

**على Windows (Task Scheduler):**
1. افتح Task Scheduler
2. Create Basic Task
3. اسم: "Ramadan Bot Backup"
4. Trigger: Daily at 11:00 PM
5. Action: Start a program
6. Program: `C:\path\to\backup.sh`

---

## 💡 نصائح عامة

### ✅ أفضل الممارسات:
1. **اختبر دائماً** قبل النشر الفعلي
2. **احتفظ بنسخ احتياطية** منتظمة
3. **راقب السجلات** للتأكد من عمل البوت
4. **حدّث المحتوى** سنوياً لرمضان الجديد

### ⚠️ تجنّب:
1. عدم اختبار قبل رمضان
2. مشاركة المفاتيح
3. عدم مراقبة البوت
4. تشغيل نسخ متعددة بنفس المفاتيح

---

**رمضان كريم!** 🌙

هل لديك سيناريو آخر؟ شاركنا إياه!
